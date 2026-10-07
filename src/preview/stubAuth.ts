// PREVIEW-ONLY stub: lets the real UI render without Firebase credentials.
export const getAuth = () => ({ currentUser: { uid: 'preview', getIdToken: async () => 'preview' } });
export class GoogleAuthProvider {}
export const onAuthStateChanged = (_auth: unknown, cb: (u: unknown) => void) => {
  setTimeout(() => cb({ uid: 'preview', email: 'ahmad@marketingcharm.agency', getIdToken: async () => 'preview' }), 0);
  return () => {};
};
export const signInWithPopup = async () => ({});
export const createUserWithEmailAndPassword = async () => ({});
export const signOut = async () => {};
export type User = { uid: string; email?: string | null; getIdToken: () => Promise<string> };
