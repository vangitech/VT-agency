import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Database, Plus, Loader2, Trash2, ChevronRight,
  GripVertical, FileText, Settings, List,
  PlusCircle, X, Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FIELD_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'number', label: 'Number' },
  { id: 'date', label: 'Date' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'boolean', label: 'Yes/No' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'url', label: 'URL' },
  { id: 'textarea', label: 'Text Area' },
];

const CustomObjectsTab = () => {
  const [objectTypes, setObjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [records, setRecords] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [builderForm, setBuilderForm] = useState({
    name: '', description: '', icon: 'FileText', color: '#6366f1',
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true, showInList: true, order: 0 }],
  });

  const fetchTypes = () =>
    API.get('/custom-objects/object-types').then((r) => setObjectTypes(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { fetchTypes(); }, []);

  const openType = async (type) => {
    setSelectedType(type);
    try {
      const res = await API.get('/custom-objects/records', { params: { objectType: type._id, limit: 100 } });
      setRecords(Array.isArray(res.data.records) ? res.data.records : []);
    } catch { setRecords([]); }
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    try {
      if (builderForm._id) {
        await API.put(`/custom-objects/object-types/${builderForm._id}`, builderForm);
        toast.success('Object type updated');
      } else {
        await API.post('/custom-objects/object-types', builderForm);
        toast.success('Object type created');
      }
      setShowBuilder(false);
      setBuilderForm({ name: '', description: '', icon: 'FileText', color: '#6366f1', fields: [{ name: 'title', label: 'Title', type: 'text', required: true, showInList: true, order: 0 }] });
      fetchTypes();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Delete this object type and all its records?')) return;
    try { await API.delete(`/custom-objects/object-types/${id}`); toast.success('Deleted'); if (selectedType?._id === id) { setSelectedType(null); setRecords([]); } fetchTypes(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      const data = { objectType: selectedType._id, values: {} };
      selectedType.fields.forEach((f) => {
        data.values[f.name] = editRecord?.values?.get?.(f.name) || editRecord?.values?.[f.name] || '';
      });
      if (editRecord) {
        await API.put(`/custom-objects/records/${editRecord._id}`, data);
        toast.success('Record updated');
      } else {
        await API.post('/custom-objects/records', data);
        toast.success('Record created');
      }
      setShowRecordForm(false);
      setEditRecord(null);
      openType(selectedType);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await API.delete(`/custom-objects/records/${id}`); toast.success('Deleted'); openType(selectedType); }
    catch { toast.error('Failed to delete'); }
  };

  const addField = () => {
    const order = builderForm.fields.length;
    setBuilderForm((p) => ({ ...p, fields: [...p.fields, { name: '', label: '', type: 'text', required: false, showInList: true, order, options: [] }] }));
  };

  const updateField = (i, data) => {
    const fields = [...builderForm.fields];
    fields[i] = { ...fields[i], ...data };
    setBuilderForm((p) => ({ ...p, fields }));
  };

  const removeField = (i) => {
    setBuilderForm((p) => ({ ...p, fields: p.fields.filter((_, idx) => idx !== i) }));
  };

  const handleRecordFieldChange = (fieldName, value) => {
    const values = { ...(editRecord?.values || {}) };
    values[fieldName] = value;
    setEditRecord((p) => ({ ...p, values }));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  if (selectedType) {
    return (
      <div>
        <button onClick={() => { setSelectedType(null); setRecords([]); }} className="flex items-center gap-1.5 text-sm text-brand-blue font-medium mb-4"><ChevronRight size={16} className="rotate-180" /> Back to object types</button>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: selectedType.color }}>
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedType.name}</h2>
              <p className="text-xs text-gray-500">{selectedType.description || `${selectedType.fields?.length || 0} fields`}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="blue" size="sm" onClick={() => { setEditRecord(null); setShowRecordForm(true); }} className="rounded-xl"><Plus size={14} className="mr-1" /> Add Record</Button>
            <Button variant="outline" size="sm" onClick={() => { setBuilderForm(selectedType); setShowBuilder(true); }} className="rounded-xl"><Settings size={14} className="mr-1" /> Edit Schema</Button>
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <div className="max-h-[60vh] overflow-y-auto">
            {!Array.isArray(records) || records.length === 0 ? (
              <div className="text-center py-12"><Database size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No records yet</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                  {selectedType.fields?.filter((f) => f.showInList).slice(0, 6).map((f) => (
                    <th key={f._id || f.name} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{f.label}</th>
                  ))}
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                      {selectedType.fields?.filter((f) => f.showInList).slice(0, 6).map((f) => (
                        <td key={f._id || f.name} className="py-3 px-4 text-gray-700">
                          {f.type === 'boolean' ? (r.values?.get?.(f.name) || r.values?.[f.name] ? 'Yes' : 'No')
                            : f.type === 'date' ? (r.values?.get?.(f.name) || r.values?.[f.name] || '').slice(0, 10)
                            : r.values?.get?.(f.name) || r.values?.[f.name] || '-'}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditRecord(r); setShowRecordForm(true); }}><Settings size={12} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(r._id)}><Trash2 size={12} className="text-gray-400" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {showRecordForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowRecordForm(false); }}>
            <Card className="w-full max-w-lg mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{editRecord ? 'Edit Record' : 'New Record'} — {selectedType.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowRecordForm(false)}><X size={16} /></Button>
                </div>
                <form onSubmit={handleSaveRecord} className="space-y-3">
                  {selectedType.fields?.map((f, i) => (
                    <div key={f._id || i} className="space-y-1">
                      <Label>{f.label} {f.required && <span className="text-red-500">*</span>}</Label>
                      {f.type === 'textarea' ? (
                        <Textarea value={editRecord?.values?.[f.name] || ''} onChange={(e) => handleRecordFieldChange(f.name, e.target.value)} required={f.required} className="rounded-xl" rows={3} />
                      ) : f.type === 'dropdown' ? (
                        <select value={editRecord?.values?.[f.name] || ''} onChange={(e) => handleRecordFieldChange(f.name, e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3">
                          <option value="">Select...</option>
                          {f.options?.map((o, oi) => <option key={oi} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={editRecord?.values?.[f.name] === 'true'} onChange={(e) => handleRecordFieldChange(f.name, e.target.checked ? 'true' : 'false')} className="rounded" />
                          <span className="text-sm text-gray-600">{f.label}</span>
                        </div>
                      ) : f.type === 'number' ? (
                        <Input type="number" value={editRecord?.values?.[f.name] || ''} onChange={(e) => handleRecordFieldChange(f.name, e.target.value)} required={f.required} className="h-10 rounded-xl" />
                      ) : (
                        <Input type={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : f.type === 'phone' ? 'tel' : 'text'}
                          value={editRecord?.values?.[f.name] || ''} onChange={(e) => handleRecordFieldChange(f.name, e.target.value)} required={f.required} className="h-10 rounded-xl" />
                      )}
                    </div>
                  ))}
                  <Button type="submit" variant="blue" className="rounded-xl w-full">{editRecord ? 'Update' : 'Create Record'}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Custom Objects</h2>
          <p className="text-sm text-gray-500 mt-1">Create custom data structures beyond contacts and deals</p>
        </div>
        <Button variant="blue" onClick={() => { setBuilderForm({ name: '', description: '', icon: 'FileText', color: '#6366f1', fields: [{ name: 'title', label: 'Title', type: 'text', required: true, showInList: true, order: 0 }] }); setShowBuilder(true); }} className="rounded-xl">
          <Plus size={16} className="mr-1.5" /> New Object Type
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {!Array.isArray(objectTypes) || objectTypes.length === 0 ? (
          <div className="col-span-full text-center py-16"><Database size={40} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No custom objects yet</p></div>
        ) : objectTypes.map((obj) => (
          <button key={obj._id} onClick={() => openType(obj)} className="text-left">
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-brand-blue/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: obj.color }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{obj.name}</p>
                    <p className="text-xs text-gray-500">{obj.fields?.length || 0} fields {obj.recordCount > 0 ? `· ${obj.recordCount} records` : ''}</p>
                  </div>
                </div>
                {obj.description && <p className="text-xs text-gray-400 line-clamp-2">{obj.description}</p>}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {obj.fields?.slice(0, 4).map((f, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.label}</span>
                  ))}
                  {(obj.fields?.length || 0) > 4 && <span className="text-[10px] text-gray-400">+{obj.fields.length - 4} more</span>}
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowBuilder(false); }}>
          <Card className="w-full max-w-2xl mx-4 border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">{builderForm._id ? 'Edit Object Type' : 'New Object Type'}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)}><X size={16} /></Button>
              </div>
              <form onSubmit={handleSaveType} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Name</Label><Input value={builderForm.name} onChange={(e) => setBuilderForm((p) => ({ ...p, name: e.target.value }))} required className="h-10 rounded-xl" placeholder="e.g., Asset, Contract" /></div>
                  <div className="space-y-1"><Label>Color</Label><Input type="color" value={builderForm.color} onChange={(e) => setBuilderForm((p) => ({ ...p, color: e.target.value }))} className="h-10 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={builderForm.description} onChange={(e) => setBuilderForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Fields</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addField} className="rounded-xl text-xs"><Plus size={12} className="mr-1" /> Add Field</Button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {builderForm.fields.map((field, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">Field {i + 1}</span>
                          {i > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => removeField(i)}><Trash2 size={12} className="text-gray-400" /></Button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="space-y-1"><Label className="text-[10px]">Name (slug)</Label><Input value={field.name} onChange={(e) => updateField(i, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_') })} className="h-8 rounded-lg text-xs" placeholder="field_name" required /></div>
                          <div className="space-y-1"><Label className="text-[10px]">Label</Label><Input value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} className="h-8 rounded-lg text-xs" placeholder="Field Label" required /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1"><Label className="text-[10px]">Type</Label>
                            <select value={field.type} onChange={(e) => updateField(i, { type: e.target.value })} className="w-full h-8 rounded-lg border border-gray-200 text-xs px-2">
                              {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1"><Label className="text-[10px]">Required</Label>
                            <div className="flex items-center h-8"><input type="checkbox" checked={field.required} onChange={(e) => updateField(i, { required: e.target.checked })} className="rounded" /></div>
                          </div>
                          <div className="space-y-1"><Label className="text-[10px]">Show in List</Label>
                            <div className="flex items-center h-8"><input type="checkbox" checked={field.showInList} onChange={(e) => updateField(i, { showInList: e.target.checked })} className="rounded" /></div>
                          </div>
                        </div>
                        {field.type === 'dropdown' && (
                          <div className="space-y-1 mt-2">
                            <Label className="text-[10px]">Options (comma separated)</Label>
                            <Input value={field.options?.join(', ') || ''} onChange={(e) => updateField(i, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })} className="h-8 rounded-lg text-xs" placeholder="Option A, Option B, Option C" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="blue" className="rounded-xl w-full">
                  <Save size={14} className="mr-1.5" /> {builderForm._id ? 'Update Object Type' : 'Create Object Type'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomObjectsTab;
