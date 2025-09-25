
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  user: any;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }

  setUser(user: any) {
    this.user = this.stripFirebaseInternal(user);
  }
  
  private stripFirebaseInternal(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.stripFirebaseInternal(item));
    }
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key !== 'toJSON' && key !== 'proactiveRefresh') {
           newObj[key] = this.stripFirebaseInternal(obj[key]);
        }
      }
    }
    return newObj;
  }

  toDiagnosticString(): string {
    return JSON.stringify({
      message: this.message,
      context: this.context,
      user: this.user,
    }, null, 2);
  }
}
