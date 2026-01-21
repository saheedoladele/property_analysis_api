// Export entities - using a function to delay evaluation and break circular dependencies
export function getEntities() {
  // Import entities dynamically to avoid circular dependency issues
  return Promise.all([
    import('./Contact.js').then(m => m.Contact),
    import('./DealAudit.js').then(m => m.DealAudit),
    import('./User.js').then(m => m.User),
    import('./Subscription.js').then(m => m.Subscription),
    import('./Payment.js').then(m => m.Payment),
    import('./Property.js').then(m => m.Property),
    import('./Analysis.js').then(m => m.Analysis),
  ]);
}

// Also export individually for direct imports
export { Contact } from './Contact.js';
export { DealAudit } from './DealAudit.js';
export { User } from './User.js';
export { Subscription } from './Subscription.js';
export { Payment } from './Payment.js';
export { Property } from './Property.js';
export { Analysis } from './Analysis.js';
