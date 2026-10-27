

/**
 * Admin Audit Form Builder
 * Allows Super Admin to customize audit form fields, labels, types, and validation
 */

import React, { useState, useEffect } from 'react';
import { DEFAULT_AUDIT_FORM_FIELDS, FormField } from '../utils/auditFormFieldsConfig';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, AlertCircle } from 'lucide-react';

interface AdminAuditFormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: FormField[]) => Promise<void>;
  currentFields?: FormField[];
}

const SECTIONS = [
  { number: 1, name: 'Facility Identification' },
  { number: 2, name: 'Energy Source & Consumption' },
  { number: 3, name: 'Diesel & Backup Power' },
  { number: 4, name: 'Renewable Energy' },
  { number: 5, name: 'Infrastructure & Load' },
  { number: 6, name: 'Operations & Maintenance' },
  { number: 7, name: 'Environmental & Safety' },
  { number: 8, name: 'Waste Management' },
  { number: 9, name: 'Cold Chain & Critical Services' },
  { number: 10, name: 'Carbon & Climate' }
];

const FIELD_TYPES = ['text', 'number', 'select', 'checkbox', 'textarea', 'date'];

const AdminAuditFormBuilder: React.FC<AdminAuditFormBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  currentFields = []
}) => {
  const [fields, setFields] = useState<FormField[]>(currentFields.length > 0 ? currentFields : DEFAULT_AUDIT_FORM_FIELDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  useEffect(() => {
    if (isOpen) {
      setFields(currentFields.length > 0 ? currentFields : DEFAULT_AUDIT_FORM_FIELDS);
    }
  }, [isOpen, currentFields]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      fieldName: '',
      label: '',
      type: 'text',
      section: expandedSection || 1,
      sectionName: SECTIONS.find(s => s.number === (expandedSection || 1))?.name || '',
      required: false,
      placeholder: '',
      helperText: ''
    };
    setEditingId(newField.id);
    setEditingField(newField);
  };

  const startEdit = (field: FormField) => {
    setEditingId(field.id);
    setEditingField({ ...field });
  };

  const saveField = () => {
    if (!editingField) return;

    if (!editingField.fieldName.trim()) {
      setError('Field name is required');
      return;
    }
    if (!editingField.label.trim()) {
      setError('Label is required');
      return;
    }

    const existingIndex = fields.findIndex(f => f.id === editingField.id);
    if (existingIndex >= 0) {
      const updated = [...fields];
      updated[existingIndex] = editingField;
      setFields(updated);
    } else {
      setFields([...fields, editingField]);
    }

    setEditingId(null);
    setEditingField(null);
    setError('');
  };

  const deleteField = (id: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      setFields(fields.filter(f => f.id !== id));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setError('');
  };

  const handleSave = async () => {
    if (editingId) {
      setError('Please finish editing the current field first');
      return;
    }
    setSaving(true);
    try {
      await onSave(fields);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const groupedFields = SECTIONS.map(section => ({
    ...section,
    fields: fields.filter(f => f.section === section.number)
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Audit Form Builder</h2>
            <p className="text-xs text-slate-600 mt-1">Customize form fields, labels, and validation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Edit Panel */}
          {editingField && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-slate-900">
                {editingField.id.startsWith('field_') && !fields.some(f => f.id === editingField.id)
                  ? 'Add New Field'
                  : 'Edit Field'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Field Name (unique identifier)</label>
                  <input
                    type="text"
                    value={editingField.fieldName}
                    onChange={(e) => setEditingField({ ...editingField, fieldName: e.target.value })}
                    placeholder="e.g., gridUptimeHoursPerDay"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Display Label</label>
                  <input
                    type="text"
                    value={editingField.label}
                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                    placeholder="e.g., Grid Uptime (hours/day)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Field Type</label>
                  <select
                    value={editingField.type}
                    onChange={(e) => setEditingField({ ...editingField, type: e.target.value as FormField['type'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
                  <select
                    value={editingField.section}
                    onChange={(e) => {
                      const section = parseInt(e.target.value);
                      setEditingField({
                        ...editingField,
                        section,
                        sectionName: SECTIONS.find(s => s.number === section)?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTIONS.map(section => (
                      <option key={section.number} value={section.number}>
                        {section.number}. {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingField.required}
                      onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">Required Field</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Indicator</label>
                  <input
                    type="text"
                    value={editingField.linkedIndicator || ''}
                    onChange={(e) => setEditingField({ ...editingField, linkedIndicator: e.target.value })}
                    placeholder="e.g., gridUptimePercentage"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Helper Text / Description</label>
                <textarea
                  value={editingField.helperText || ''}
                  onChange={(e) => setEditingField({ ...editingField, helperText: e.target.value })}
                  placeholder="Show this text below the field to help users"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Field
                </button>
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {groupedFields.map(section => (
              <div key={section.number} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === section.number ? null : section.number)}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-slate-900">
                    {section.number}. {section.name} ({section.fields.length} fields)
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedSection === section.number ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedSection === section.number && (
                  <div className="p-4 space-y-2 bg-white">
                    {section.fields.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No fields in this section yet</p>
                    ) : (
                      section.fields.map(field => (
                        <div key={field.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start justify-between hover:bg-slate-100">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{field.label}</p>
                            <p className="text-xs text-slate-600">{field.fieldName} • {field.type} {field.required ? '• Required' : ''}</p>
                            {field.linkedIndicator && <p className="text-xs text-blue-600">→ {field.linkedIndicator}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(field)}
                              className="p-2 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteField(field.id)}
                              className="p-2 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between gap-3">
          <button
            onClick={addField}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editingId !== null}
              className="px-6 py-2 bg-[#057A55] text-white rounded-lg hover:bg-[#045C41] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? '⏳ Saving...' : '✅ Save Form Structure'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditFormBuilder;
