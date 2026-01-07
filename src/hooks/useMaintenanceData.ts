import { useState, useCallback } from 'react';
import { 
  Asset, 
  WorkOrder, 
  Alert, 
  TBMPolicy, 
  CBMPolicy, 
  ChecklistItem 
} from '@/types/maintenance';
import { 
  mockAssets, 
  mockWorkOrders, 
  mockAlerts, 
  mockTBMPolicies, 
  mockCBMPolicies 
} from '@/data/mockData';

// Assets CRUD
export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  const createAsset = useCallback((asset: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...asset,
      id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
    };
    setAssets(prev => [...prev, newAsset]);
    return newAsset;
  }, [assets.length]);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAssetById = useCallback((id: string) => {
    return assets.find(a => a.id === id);
  }, [assets]);

  return { assets, createAsset, updateAsset, deleteAsset, getAssetById };
}

// Work Orders CRUD
export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);

  const createWorkOrder = useCallback((wo: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    const newWO: WorkOrder = {
      ...wo,
      id: `WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setWorkOrders(prev => [...prev, newWO]);
    return newWO;
  }, [workOrders.length]);

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ...updates } : wo));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  }, []);

  const updateChecklist = useCallback((woId: string, checklist: ChecklistItem[]) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === woId ? { ...wo, checklist } : wo
    ));
  }, []);

  const startWorkOrder = useCallback((id: string, assignee: string) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: 'in_progress', assignee } : wo
    ));
  }, []);

  const completeWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: 'done', completedAt: new Date().toISOString() } : wo
    ));
  }, []);

  const getWorkOrderById = useCallback((id: string) => {
    return workOrders.find(wo => wo.id === id);
  }, [workOrders]);

  return { 
    workOrders, 
    createWorkOrder, 
    updateWorkOrder, 
    deleteWorkOrder, 
    updateChecklist,
    startWorkOrder,
    completeWorkOrder,
    getWorkOrderById,
  };
}

// Alerts CRUD
export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, acknowledged: true } : a
    ));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a
    ));
  }, []);

  const createAlertFromCBM = useCallback((
    assetId: string,
    assetName: string,
    metric: Alert['metric'],
    value: number,
    threshold: number,
    severity: Alert['severity']
  ) => {
    const newAlert: Alert = {
      id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
      assetId,
      assetName,
      metric,
      value,
      threshold,
      severity,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, [alerts.length]);

  return { alerts, acknowledgeAlert, resolveAlert, createAlertFromCBM };
}

// TBM Policies CRUD
export function useTBMPolicies() {
  const [policies, setPolicies] = useState<TBMPolicy[]>(mockTBMPolicies);

  const createPolicy = useCallback((policy: Omit<TBMPolicy, 'id'>) => {
    const newPolicy: TBMPolicy = {
      ...policy,
      id: `TBM-${String(policies.length + 1).padStart(3, '0')}`,
    };
    setPolicies(prev => [...prev, newPolicy]);
    return newPolicy;
  }, [policies.length]);

  const updatePolicy = useCallback((id: string, updates: Partial<TBMPolicy>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePolicy = useCallback((id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  }, []);

  const togglePolicy = useCallback((id: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  }, []);

  return { policies, createPolicy, updatePolicy, deletePolicy, togglePolicy };
}

// CBM Policies CRUD
export function useCBMPolicies() {
  const [policies, setPolicies] = useState<CBMPolicy[]>(mockCBMPolicies);

  const createPolicy = useCallback((policy: Omit<CBMPolicy, 'id'>) => {
    const newPolicy: CBMPolicy = {
      ...policy,
      id: `CBM-${String(policies.length + 1).padStart(3, '0')}`,
    };
    setPolicies(prev => [...prev, newPolicy]);
    return newPolicy;
  }, [policies.length]);

  const updatePolicy = useCallback((id: string, updates: Partial<CBMPolicy>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePolicy = useCallback((id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  }, []);

  const togglePolicy = useCallback((id: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  }, []);

  return { policies, createPolicy, updatePolicy, deletePolicy, togglePolicy };
}
