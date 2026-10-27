

/**
 * Hook to check if audit forms are globally open/closed
 * Controlled by Super Admin Console
 */

export const useAuditFormControl = () => {
  const isAuditFormsOpen = () => {
    const status = localStorage.getItem('auditFormsOpen');
    // Default to true if not set, for backward compatibility
    return status !== 'false';
  };

  return {
    isOpen: isAuditFormsOpen(),
    status: localStorage.getItem('auditFormsOpen') || 'true'
  };
};
