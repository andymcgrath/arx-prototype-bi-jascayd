import { createClient } from '@supabase/supabase-js'
import { useState, useEffect, useCallback } from 'react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Types ──────────────────────────────────────────────────────────────────
export type FlowType = 'Fax_QS_PA_Approved' | 'Fax_PAP_Audit' | 'CoA_DTP'
export type Portal   = 'HUB' | 'Patient' | 'Provider' | 'Pharmacy' | 'FRM' | 'Analytics'

export interface DemoState {
  id:                 string
  flow_type:          FlowType
  enrollment_status:  'pending' | 'enrolled'
  consent_status:     'pending' | 'confirmed' | 'declined'
  bi_status:          'none' | 'running' | 'complete'
  bi_result:          'coverage_found' | 'no_coverage' | 'no_insurance' | null
  pa_status:          'none' | 'submitted' | 'approved' | 'denied'
  qs_status:          'none' | 'active' | 'discontinued'
  pap_status:         'none' | 'active' | 'audit_pending' | 'discontinued'
  pharmacy_status:    'none' | 'processing' | 'shipped' | 'delivered'
  workflow_step:      1 | 2 | 3 | 4 | 5 | 6
  updated_at:         string
  updated_by:         Portal | 'system' | null
}

export interface DemoEvent {
  id:            string
  event_type:    string
  portal:        Portal
  flow_type:     FlowType
  workflow_step: number
  metadata:      Record | null
  created_at:    string
}

// ── Step derivation ────────────────────────────────────────────────────────
function deriveStep(s: Partial): number {
  if (s.pharmacy_status === 'delivered')                              return 6
  if (['processing','shipped'].includes(s.pharmacy_status ?? ''))    return 5
  if (s.pa_status === 'approved' || s.pa_status === 'denied')        return 4
  if (s.pa_status === 'submitted' ||
      s.qs_status === 'active'   ||
      s.pap_status === 'active')                                      return 3
  if (s.enrollment_status === 'enrolled')                             return 2
  return 1
}

// ── Main hook ──────────────────────────────────────────────────────────────
export function useDemoState(portal: Portal) {
  const [state, setState]   = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Initial fetch + realtime subscription
  useEffect(() => {
    // Fetch current state
    supabase
      .from('demo_state')
      .select('*')
      .eq('id', 'demo')
      .single()
      .then(({ data }) => { if (data) setState(data); setLoading(false) })

    // Fetch recent events
    supabase
      .from('demo_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setEvents(data) })

    // Subscribe to state changes
    const stateChannel = supabase
      .channel('demo_state_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'demo_state' },
        (payload) => setState(payload.new as DemoState)
      )
      .subscribe()

    // Subscribe to new events
    const eventChannel = supabase
      .channel('demo_event_inserts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'demo_events' },
        (payload) => setEvents(prev => [payload.new as DemoEvent, ...prev].slice(0, 50))
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stateChannel)
      supabase.removeChannel(eventChannel)
    }
  }, [])

  // ── Action helpers ────────────────────────────────────────────────────────

  const writeState = useCallback(async (
    patch: Partial,
    eventType: string,
    metadata?: Record
  ) => {
    const next = { ...state, ...patch, updated_by: portal, updated_at: new Date().toISOString() }
    next.workflow_step = deriveStep(next) as DemoState['workflow_step']

    await supabase.from('demo_state').update(next).eq('id', 'demo')
    await supabase.from('demo_events').insert({
      event_type:    eventType,
      portal,
      flow_type:     next.flow_type,
      workflow_step: next.workflow_step,
      metadata:      metadata ?? null
    })
  }, [state, portal])

  // Individual actions — call these from TransitionButton onClick handlers
  const actions = {
    enrollPatient:   () => writeState({ enrollment_status: 'enrolled', consent_status: 'confirmed' }, 'consent_confirmed'),
    runBI:           () => writeState({ bi_status: 'running' }, 'bi_initiated'),
    completeBI:      (result: DemoState['bi_result']) => writeState({ bi_status: 'complete', bi_result: result }, 'bi_complete', { result }),
    submitPA:        () => writeState({ pa_status: 'submitted' }, 'pa_submitted'),
    approvePA:       () => writeState({ pa_status: 'approved' }, 'pa_approved'),
    denyPA:          () => writeState({ pa_status: 'denied' }, 'pa_denied'),
    activateQS:      () => writeState({ qs_status: 'active', pa_status: 'submitted' }, 'qs_authorized'),
    discontinueQS:   () => writeState({ qs_status: 'discontinued' }, 'qs_discontinued'),
    enrollPAP:       () => writeState({ pap_status: 'active' }, 'pap_enrolled'),
    auditPAP:        () => writeState({ pap_status: 'audit_pending' }, 'pap_audit_initiated'),
    discontinuePAP:  () => writeState({ pap_status: 'discontinued' }, 'pap_discontinued'),
    fillRx:          () => writeState({ pharmacy_status: 'processing' }, 'rx_filled'),
    shipRx:          () => writeState({ pharmacy_status: 'shipped' }, 'rx_shipped'),
    deliverRx:       () => writeState({ pharmacy_status: 'delivered' }, 'rx_delivered'),
    changeFlow:      (flow: FlowType) => writeState({ flow_type: flow }, 'flow_changed', { flow }),
    resetDemo:       async () => {
      await supabase.rpc('reset_demo')
      await supabase.from('demo_events').insert({
        event_type: 'demo_reset', portal, flow_type: 'Fax_QS_PA_Approved', workflow_step: 1
      })
    }
  }

  return { state, events, loading, actions }
}
