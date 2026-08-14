import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, Loader2, ShieldPlus } from 'lucide-react';
import { adminApi, type Technician, type Usage } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const iso = (value: string) => new Date(value).toLocaleString();

export default function AdminPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Technician['role']>('technician');
  const [filters, setFilters] = useState({ technician: '', serial: '', outcome: '', from: '', to: '' });

  const loadTechnicians = async () => setTechnicians((await adminApi.technicians()).technicians);
  const loadUsage = async () => {
    const search = new URLSearchParams({ limit: '50' });
    Object.entries(filters).forEach(([key, value]) => { if (value) search.set(key, value); });
    setUsage((await adminApi.usage(search)).usage);
  };
  const load = async () => {
    setLoading(true);
    try { await Promise.all([loadTechnicians(), loadUsage()]); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to load administration data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await adminApi.create({ username, password, role });
      setUsername(''); setPassword('');
      await loadTechnicians();
      toast.success('Account created');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to create account'); }
  };
  const toggle = async (account: Technician) => {
    try {
      await adminApi.update(account.id, { active: !account.active });
      await loadTechnicians();
      toast.success(account.active ? 'Account disabled and sessions revoked' : 'Account enabled');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update account'); }
  };
  const reset = async (account: Technician) => {
    const nextPassword = window.prompt(`Set a new password for ${account.name} (10–128 characters)`);
    if (nextPassword === null) return;
    if (nextPassword.length < 10 || nextPassword.length > 128) {
      toast.error('Password must be between 10 and 128 characters'); return;
    }
    try {
      await adminApi.resetPassword(account.id, nextPassword);
      toast.success('Password reset and sessions revoked');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to reset password'); }
  };

  return <div className="mx-auto max-w-[1400px] space-y-8 p-6 md:p-8">
    <div><h1 className="text-3xl font-bold">Administration</h1><p className="mt-1 text-sm text-muted-foreground">Manage authorised CraneHub accounts and review daycode activity.</p></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : <>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldPlus className="h-5 w-5 text-primary" />Add account</CardTitle></CardHeader><CardContent>
        <form onSubmit={create} className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Username" autoComplete="username" maxLength={160} value={username} onChange={(event) => setUsername(event.target.value)} required />
          <Input placeholder="Password (10–128 characters)" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as Technician['role'])}><option value="technician">Technician</option><option value="admin">Administrator</option></select>
          <Button type="submit"><KeyRound className="mr-2 h-4 w-4" />Create Account</Button>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b text-left text-muted-foreground"><tr><th className="p-2">Username</th><th>Role</th><th>Status</th><th>Created</th><th className="text-right">Actions</th></tr></thead><tbody>
          {technicians.map((account) => <tr className="border-b" key={account.id}><td className="p-2 font-medium">{account.name}</td><td><Badge variant="secondary">{account.role === 'admin' ? 'Administrator' : 'Technician'}</Badge></td><td><Badge variant={account.active ? 'default' : 'destructive'}>{account.active ? 'Active' : 'Disabled'}</Badge></td><td>{iso(account.createdAt)}</td><td className="space-x-2 py-2 text-right"><Button size="sm" variant="outline" onClick={() => void toggle(account)}>{account.active ? 'Disable' : 'Enable'}</Button><Button size="sm" variant="secondary" onClick={() => void reset(account)}>Reset password</Button></td></tr>)}
        </tbody></table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Daycode Usage Register</CardTitle></CardHeader><CardContent className="space-y-4">
        <form onSubmit={(event) => { event.preventDefault(); void loadUsage(); }} className="grid gap-2 md:grid-cols-3"><Input placeholder="Username" value={filters.technician} onChange={(event) => setFilters({ ...filters, technician: event.target.value })} /><Input placeholder="Serial number" value={filters.serial} onChange={(event) => setFilters({ ...filters, serial: event.target.value })} /><select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.outcome} onChange={(event) => setFilters({ ...filters, outcome: event.target.value })}><option value="">All outcomes</option><option value="success">Success</option><option value="denied">Denied</option><option value="validation_failed">Validation failed</option></select><Input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><Input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /><Button type="submit">Apply filters</Button></form>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b text-left text-muted-foreground"><tr><th className="p-2">Username</th><th>Serial</th><th>Requested date</th><th>Outcome</th><th>Reason</th><th>Timestamp</th></tr></thead><tbody>{usage.map((entry) => <tr className="border-b" key={entry.id}><td className="p-2">{entry.technicianName}</td><td>{entry.craneSerialNumber ?? '—'}</td><td>{entry.requestedDate ?? '—'}</td><td><Badge variant="secondary">{entry.outcome}</Badge></td><td>{entry.denialReason ?? '—'}</td><td>{iso(entry.createdAt)}</td></tr>)}</tbody></table></div>
      </CardContent></Card>
    </>}
  </div>;
}
