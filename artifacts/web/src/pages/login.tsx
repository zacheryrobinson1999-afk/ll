import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { KeyRound, Loader2 } from 'lucide-react';
import { login } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [, setLocation] = useLocation(); const { refresh } = useAuth();
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { await login(username, password); await refresh(); setLocation('/'); } catch { setError('Invalid username or password'); } finally { setBusy(false); } };
  return <div className="dark flex min-h-[100dvh] items-center justify-center bg-background p-4 text-foreground"><form onSubmit={submit} className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-7 shadow-2xl"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary font-black text-primary-foreground">CH</div><div><h1 className="brand-heading text-3xl font-bold"><span>CRANE</span><span className="text-primary">HUB</span></h1><p className="text-xs font-bold uppercase tracking-[.2em] text-muted-foreground">Account access</p></div></div><div className="space-y-2"><label htmlFor="username" className="text-sm font-medium">Username</label><Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={160} required /></div><div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Password</label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} required /></div>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}Sign in</Button></form></div>;
}
