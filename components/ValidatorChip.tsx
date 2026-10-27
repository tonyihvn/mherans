

/**
 * ValidatorChip Component - NHERAMS Prototype
 * Displays validator status: pending (neutral), signed (success), N/A (muted)
 */

import React from 'react';
import { Validator, ValidatorStatus, ValidatorOrg } from '../types';
import { Check, Clock, X } from 'lucide-react';

const ValidatorOrgLabel = {
  [ValidatorOrg.STATE_MOH]: 'State MOH',
  [ValidatorOrg.NEMSA]: 'NEMSA',
  [ValidatorOrg.SAFECARE_EHS]: 'SafeCare/EHS'
};

interface ValidatorChipProps {
  validator: Validator;
}

const ValidatorChip: React.FC<ValidatorChipProps> = ({ validator }) => {
  const label = ValidatorOrgLabel[validator.org];

  const getStatusStyle = () => {
    switch (validator.status) {
      case ValidatorStatus.SIGNED:
        return {
          bg: '#E8F5E9',
          text: '#1B5E20',
          icon: Check,
          borderColor: '#81C784'
        };
      case ValidatorStatus.PENDING:
        return {
          bg: '#FFF3E0',
          text: '#E65100',
          icon: Clock,
          borderColor: '#FFB74D'
        };
      case ValidatorStatus.NOT_APPLICABLE:
        return {
          bg: '#EEEEEE',
          text: '#616161',
          icon: X,
          borderColor: '#BDBDBD'
        };
      default:
        return {
          bg: '#EEEEEE',
          text: '#616161',
          icon: X,
          borderColor: '#BDBDBD'
        };
    }
  };

  const style = getStatusStyle();
  const Icon = style.icon;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.borderColor
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
      <span className="capitalize">{validator.status === ValidatorStatus.NOT_APPLICABLE ? 'n/a' : validator.status}</span>
    </div>
  );
};

export default ValidatorChip;
