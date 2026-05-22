
import { useEffect, useMemo, useState } from 'react';

const initialData = {
  companies: ['Óptica Center', 'Vieira Matos', 'RedePhone', 'Pessoal'],
  categories: ['Aluguel', 'Energia', 'Internet', 'Funcionários', 'Fornecedores', 'Anúncios', 'Cartão', 'Transporte', 'Outros'],
  bills: [
    { id: 1, name: 'Aluguel Óptica Center', amount: 3000, dueDay: 5, company: 'Óptica Center', category: 'Aluguel', status: 'Pendente' },
    { id: 2, name: 'Energia', amount: 850, dueDay: 10, company: 'Óptica Center', category: 'Energia', status: 'Pago' },
    { id: 3, name: 'Meta Ads', amount: 1500, dueDay: 12, company: 'Óptica Center', category: 'Anúncios', status: 'Atrasado' },
    { id: 4, name: 'Internet', amount: 120, dueDay: 15, company: 'Pessoal', category: 'Internet', status: 'Pendente' },
  ],
  expenses: [
    { id: 1, description: 'Compra de armações', amount: 2500, company: 'Óptica Center', category: 'Fornecedores', date: '2026-05-18' },
    { id: 2, description: 'Combustível', amount: 200, company: 'Pessoal', category: 'Transporte', date: '2026-05-19' },
  ],
  revenues: [
    { id: 1, description: 'Vendas Óptica Center', amount: 22000, company: 'Óptica Center', method: 'Pix/cartão', date: '2026-05-20' },
    { id: 2, description: 'Comissões Vieira Matos', amount: 13000, company: 'Vieira Matos', method: 'Pix', date: '2026-05-20' },
  ],
};

const methods = ['Pix', 'Cartão', 'Dinheiro', 'Boleto', 'Transferência'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function load(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function downloadCSV(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(';');
  const body = rows.map((row) => Object.values(row).map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function MyFinanceApp() {
  const [tab, setTab] = useState('inicio');
  const [companyFilter, setCompanyFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [companies, setCompanies] = useState(() => load('myfinance_companies', initialData.companies));
  const [categories, setCategories] = useState(() => load('myfinance_categories', initialData.categories));
  const [bills, setBills] = useState(() => load('myfinance_bills', initialData.bills));
  const [expenses, setExpenses] = useState(() => load('myfinance_expenses', initialData.expenses));
  const [revenues, setRevenues] = useState(() => load('myfinance_revenues', initialData.revenues));
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingBillId, setEditingBillId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLogged, setIsLogged] = useState(true);
  const [userName, setUserName] = useState('Renato');
  const [search, setSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, title: 'Reserva de emergência', target: 10000, current: 3500 },
    { id: 2, title: 'Nova loja', target: 50000, current: 12000 },
  ]);
  const [goalForm, setGoalForm] = useState({ title: '', target: '', current: '' });
  const [billForm, setBillForm] = useState({ name: '', amount: '', dueDay: '', company: 'Óptica Center', category: 'Outros' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', company: 'Óptica Center', category: 'Outros', date: today() });
  const [revenueForm, setRevenueForm] = useState({ description: '', amount: '', company: 'Óptica Center', method: 'Pix', date: today() });

  useEffect(() => save('myfinance_companies', companies), [companies]);
  useEffect(() => save('myfinance_categories', categories), [categories]);
  useEffect(() => save('myfinance_bills', bills), [bills]);
  useEffect(() => save('myfinance_expenses', expenses), [expenses]);
  useEffect(() => save('myfinance_revenues', revenues), [revenues]);

  const filteredBills = bills.filter((b) => (companyFilter === 'Todas' || b.company === companyFilter) && (statusFilter === 'Todos' || b.status === statusFilter) && (!showOnlyPending || b.status !== 'Pago') && (`${b.name} ${b.company} ${b.category}`.toLowerCase().includes(search.toLowerCase())));
  const filteredExpenses = expenses.filter((e) => (companyFilter === 'Todas' || e.company === companyFilter) && (!currentMonth || e.date?.slice(0, 7) === currentMonth) && (`${e.description} ${e.company} ${e.category}`.toLowerCase().includes(search.toLowerCase())));
  const filteredRevenues = revenues.filter((r) => (companyFilter === 'Todas' || r.company === companyFilter) && (!currentMonth || r.date?.slice(0, 7) === currentMonth) && (`${r.description} ${r.company} ${r.method}`.toLowerCase().includes(search.toLowerCase())));

  const totals = useMemo(() => {
    const revenue = filteredRevenues.reduce((s, i) => s + i.amount, 0);
    const paidBills = filteredBills.filter((b) => b.status === 'Pago').reduce((s, i) => s + i.amount, 0);
    const pendingBills = filteredBills.filter((b) => b.status !== 'Pago').reduce((s, i) => s + i.amount, 0);
    const variableExpenses = filteredExpenses.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = paidBills + pendingBills + variableExpenses;
    return { revenue, paidBills, pendingBills, variableExpenses, totalExpenses, forecast: revenue - totalExpenses, overdue: filteredBills.filter((b) => b.status === 'Atrasado').length };
  }, [filteredBills, filteredExpenses, filteredRevenues]);

  function addBill(e) {
    e.preventDefault();
    if (!billForm.name || !billForm.amount || !billForm.dueDay) return;

    if (editingBillId) {
      setBills(bills.map((bill) => bill.id === editingBillId ? { ...bill, name: billForm.name, amount: Number(billForm.amount), dueDay: Number(billForm.dueDay), company: billForm.company, category: billForm.category } : bill));
      setEditingBillId(null);
    } else {
      setBills([...bills, { id: Date.now(), name: billForm.name, amount: Number(billForm.amount), dueDay: Number(billForm.dueDay), company: billForm.company, category: billForm.category, status: 'Pendente' }]);
    }

    setBillForm({ name: '', amount: '', dueDay: '', company: companies[0] || 'Pessoal', category: 'Outros' });
    setTab('contas');
  }

  function editBill(bill) {
    setEditingBillId(bill.id);
    setBillForm({ name: bill.name, amount: String(bill.amount), dueDay: String(bill.dueDay), company: bill.company, category: bill.category });
    setTab('nova-conta');
  }

  function addExpense(e) {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;
    setExpenses([...expenses, { ...expenseForm, id: Date.now(), amount: Number(expenseForm.amount) }]);
    setExpenseForm({ description: '', amount: '', company: companies[0] || 'Pessoal', category: 'Outros', date: today() });
    setTab('despesas');
  }

  function addRevenue(e) {
    e.preventDefault();
    if (!revenueForm.description || !revenueForm.amount) return;
    setRevenues([...revenues, { ...revenueForm, id: Date.now(), amount: Number(revenueForm.amount) }]);
    setRevenueForm({ description: '', amount: '', company: companies[0] || 'Pessoal', method: 'Pix', date: today() });
    setTab('receitas');
  }

  function addCompany(e) {
    e.preventDefault();
    const name = newCompany.trim();
    if (!name || companies.includes(name)) return;
    setCompanies([...companies, name]);
    setNewCompany('');
  }

  function addCategory(e) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name || categories.includes(name)) return;
    setCategories([...categories, name]);
    setNewCategory('');
  }

  function exportAll() {
    const rows = [
      ...bills.map((b) => ({ tipo: 'conta_mensal', descricao: b.name, valor: b.amount, empresa: b.company, categoria: b.category, data: `dia ${b.dueDay}`, status: b.status })),
      ...expenses.map((e) => ({ tipo: 'despesa_variavel', descricao: e.description, valor: e.amount, empresa: e.company, categoria: e.category, data: e.date, status: '' })),
      ...revenues.map((r) => ({ tipo: 'receita', descricao: r.description, valor: r.amount, empresa: r.company, categoria: r.method, data: r.date, status: '' })),
    ];
    downloadCSV('my-finance-lancamentos.csv', rows);
  }

  function exportBackup() {
    downloadJSON('my-finance-backup.json', { companies, categories, bills, expenses, revenues, exportedAt: new Date().toISOString() });
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.companies)) setCompanies(data.companies);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.bills)) setBills(data.bills);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.revenues)) setRevenues(data.revenues);
      } catch {
        alert('Não foi possível importar este arquivo. Verifique se é um backup válido do My Finance.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function generateMonthlyBills() {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextMonth = nextDate.toISOString().slice(0, 7);
    const generated = bills.map((bill) => ({ ...bill, id: Date.now() + Math.random(), status: 'Pendente', month: nextMonth }));
    setBills([...bills, ...generated]);
    setCurrentMonth(nextMonth);
  }

  function resetAll() {
    setCompanies(initialData.companies);
    setCategories(initialData.categories);
    setBills(initialData.bills);
    setExpenses(initialData.expenses);
    setRevenues(initialData.revenues);
    setCompanyFilter('Todas');
    setStatusFilter('Todos');
  }

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-blue-950">My Finance</h1>
          <p className="text-gray-500 mt-2">Entre para continuar.</p>
          <div className="space-y-4 mt-6">
            <input placeholder="Seu nome" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" />
            <input placeholder="E-mail" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" />
            <input placeholder="Senha" type="password" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" />
            <button onClick={() => setIsLogged(true)} className="w-full bg-blue-950 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition">Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen p-4 md:p-8 transition-all duration-300`}>
      <main className="max-w-6xl mx-auto pb-24">
        <header className="bg-blue-950 text-white rounded-3xl p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div><span className="text-blue-200 text-sm">Olá, {userName}</span><h1 className="text-3xl font-bold tracking-tight">My Finance</h1></div>
              <p className="text-blue-200 mt-1">Controle suas contas antes que elas controlem você.</p>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <ActionButton onClick={() => setTab('nova-receita')} label="+ Receita" color="green" />
              <ActionButton onClick={() => setTab('nova-despesa')} label="+ Despesa" color="white" />
              <ActionButton onClick={() => setTab('nova-conta')} label="+ Conta" color="blue" />
              <ActionButton onClick={exportAll} label="Exportar CSV" color="dark" />
              <ActionButton onClick={exportBackup} label="Backup" color="dark" />
              <ActionButton onClick={generateMonthlyBills} label="Virar mês" color="blue" />
              <ActionButton onClick={() => setTab('configuracoes')} label="Configurações" color="white" />
              <ActionButton onClick={() => setIsLogged(false)} label="Sair" color="white" />
            </div>
          </div>
        </header>

        <nav className="bg-white rounded-3xl p-2 shadow-sm mb-4 flex gap-2 overflow-x-auto no-print">
          {[
            ['inicio', 'Início'], ['contas', 'Contas'], ['despesas', 'Despesas'], ['receitas', 'Receitas'], ['metas', 'Metas'], ['empresas', 'Empresas'], ['categorias', 'Categorias'], ['relatorios', 'Relatórios'], ['app', 'Instalar'], ['configuracoes', 'Configurações']
          ].map(([id, label]) => <Tab key={id} id={id} label={label} active={tab === id} setTab={setTab} />)}
        </nav>

        <section className="bg-white rounded-3xl p-4 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 md:items-end no-print">
          <label className="block"><span className="font-semibold text-gray-700">Mês</span><input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 transition" /></label>
          <Select label="Empresa" value={companyFilter} options={['Todas', ...companies]} onChange={setCompanyFilter} />
          <Select label="Status das contas" value={statusFilter} options={['Todos', 'Pendente', 'Pago', 'Atrasado']} onChange={setStatusFilter} />
          <label className="block"><span className="font-semibold text-gray-700">Buscar</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lançamentos" className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 transition" /></label>
          <div className="flex flex-col gap-2"><button onClick={() => setShowOnlyPending(!showOnlyPending)} className={`px-5 py-4 rounded-2xl font-semibold transition ${showOnlyPending ? 'bg-yellow-400 text-yellow-950' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{showOnlyPending ? 'Mostrando pendentes' : 'Mostrar apenas pendentes'}</button><button onClick={resetAll} className="bg-gray-100 text-gray-700 px-5 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition">Restaurar exemplo</button></div>
        </section>

        {tab === 'inicio' && <Dashboard totals={totals} bills={filteredBills} setBills={setBills} editBill={editBill} />}
        {tab === 'contas' && <ListSection title="Contas mensais" subtitle="Tudo que você paga todo mês." right={`Falta pagar: ${money(totals.pendingBills)}`}><BillsTable bills={filteredBills} setBills={setBills} editBill={editBill} /></ListSection>}
        {tab === 'despesas' && <ListSection title="Despesas variáveis" subtitle="Gastos avulsos do dia a dia." right={`Total: ${money(totals.variableExpenses)}`}><RecordsList items={filteredExpenses} type="expense" onDelete={(id) => setExpenses(expenses.filter((e) => e.id !== id))} /></ListSection>}
        {tab === 'receitas' && <ListSection title="Receitas" subtitle="Entradas financeiras do mês." right={`Total: ${money(totals.revenue)}`}><RecordsList items={filteredRevenues} type="revenue" onDelete={(id) => setRevenues(revenues.filter((r) => r.id !== id))} /></ListSection>}
        {tab === 'metas' && <Goals goals={goals} setGoals={setGoals} goalForm={goalForm} setGoalForm={setGoalForm} />}
        {tab === 'nova-conta' && <BillForm form={billForm} setForm={setBillForm} onSubmit={addBill} companies={companies} categories={categories} editing={!!editingBillId} cancelEdit={() => { setEditingBillId(null); setBillForm({ name: '', amount: '', dueDay: '', company: companies[0] || 'Pessoal', category: 'Outros' }); }} />}
        {tab === 'nova-despesa' && <ExpenseForm form={expenseForm} setForm={setExpenseForm} onSubmit={addExpense} companies={companies} categories={categories} />}
        {tab === 'nova-receita' && <RevenueForm form={revenueForm} setForm={setRevenueForm} onSubmit={addRevenue} companies={companies} />}
        {tab === 'empresas' && <Companies companies={companies} setCompanies={setCompanies} bills={bills} expenses={expenses} newCompany={newCompany} setNewCompany={setNewCompany} addCompany={addCompany} />}
        {tab === 'categorias' && <Categories categories={categories} setCategories={setCategories} newCategory={newCategory} setNewCategory={setNewCategory} addCategory={addCategory} />}
        {tab === 'relatorios' && <Reports totals={totals} bills={filteredBills} expenses={filteredExpenses} revenues={filteredRevenues} />}
        {tab === 'app' && <InstallApp currentMonth={currentMonth} totals={totals} />}
        {tab === 'configuracoes' && <Settings darkMode={darkMode} setDarkMode={setDarkMode} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} bills={bills} exportBackup={exportBackup} importBackup={importBackup} />}
      </main>
    </div>
  );
}

function Dashboard({ totals, bills, setBills, editBill }) {
  return <div><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><Card title="Receitas" value={money(totals.revenue)} color="text-green-600" /><Card title="Despesas totais" value={money(totals.totalExpenses)} color="text-red-500" /><Card title="Contas pendentes" value={money(totals.pendingBills)} color="text-yellow-500" /><Card title="Saldo previsto" value={money(totals.forecast)} color={totals.forecast >= 0 ? 'text-blue-700' : 'text-red-600'} /></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><section className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-2xl font-bold">Próximos vencimentos</h2><p className="text-gray-500 mb-5">Resumo de contas cadastradas no período selecionado.</p><BillsTable bills={bills.slice(0, 4)} setBills={setBills} editBill={editBill} /></section><aside className="space-y-6"><div className="bg-yellow-100 rounded-3xl p-6 shadow-sm border border-yellow-200"><h2 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Atenção</h2><p className="text-yellow-700">Você ainda possui <strong>{money(totals.pendingBills)}</strong> em contas fixas para pagar.</p></div><div className="bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-xl font-bold mb-4">Resumo rápido</h2><Info label="Despesas variáveis" value={money(totals.variableExpenses)} /><Info label="Contas atrasadas" value={totals.overdue} /><Info label="Despesas totais" value={money(totals.totalExpenses)} /></div></aside></div></div>;
}

function BillsTable({ bills, setBills, editBill }) {
  const statusClass = { Pago: 'bg-green-100 text-green-700', Pendente: 'bg-yellow-100 text-yellow-700', Atrasado: 'bg-red-100 text-red-700' };
  if (!bills.length) return <Empty text="Nenhuma conta encontrada." />;
  return <div className="space-y-4">{bills.map((bill) => <div key={bill.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h3 className="font-semibold text-lg">{bill.name}</h3><p className="text-gray-500">{bill.company} • {bill.category} • vence dia {String(bill.dueDay).padStart(2, '0')}</p></div><div className="flex flex-wrap items-center gap-3"><strong>{money(bill.amount)}</strong><span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass[bill.status]}`}>{bill.status}</span>{bill.status !== 'Pago' ? <button onClick={() => setBills((all) => all.map((b) => b.id === bill.id ? { ...b, status: 'Pago' } : b))} className="bg-blue-950 text-white px-4 py-2 rounded-xl">Marcar pago</button> : <button onClick={() => setBills((all) => all.map((b) => b.id === bill.id ? { ...b, status: 'Pendente' } : b))} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl">Reabrir</button>}<button onClick={() => editBill && editBill(bill)} className="text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50">Editar</button><button onClick={() => setBills((all) => all.filter((b) => b.id !== bill.id))} className="text-red-500 px-3 py-2 rounded-xl hover:bg-red-50">Excluir</button></div></div>)}</div>;
}

function RecordsList({ items, type, onDelete }) {
  if (!items.length) return <Empty text="Nenhum lançamento encontrado." />;
  return <div className="space-y-4">{items.map((item) => <div key={item.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h3 className="font-semibold text-lg">{item.description}</h3><p className="text-gray-500">{item.company} • {item.category || item.method} • {item.date}</p></div><div className="flex items-center gap-3"><strong className={type === 'revenue' ? 'text-green-600 text-xl' : 'text-red-500 text-xl'}>{money(item.amount)}</strong><button onClick={() => onDelete(item.id)} className="text-red-500 px-3 py-2 rounded-xl hover:bg-red-50">Excluir</button></div></div>)}</div>;
}

function BillForm({ form, setForm, onSubmit, companies, categories, editing, cancelEdit }) {
  return <FormCard title={editing ? "Editar conta mensal" : "Nova conta mensal"} subtitle={editing ? "Atualize os dados da conta." : "Cadastre uma conta fixa que você paga todo mês."}><form onSubmit={onSubmit} className="space-y-4"><Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: Aluguel" /><Input label="Valor" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="Ex: 850" /><Input label="Dia do vencimento" type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} placeholder="Ex: 10" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Select label="Empresa" value={form.company} options={companies} onChange={(v) => setForm({ ...form, company: v })} /><Select label="Categoria" value={form.category} options={categories} onChange={(v) => setForm({ ...form, category: v })} /></div><div className="bg-gray-50 rounded-2xl p-4 space-y-3">
  <p className="font-semibold text-gray-700">Tipo da despesa</p>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={form.recurring === true}
      onChange={() => setForm({ ...form, recurring: true })}
    />
    <span>Mensal recorrente</span>
  </label>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={form.recurring === false}
      onChange={() => setForm({ ...form, recurring: false })}
    />
    <span>Somente este mês</span>
  </label>
</div><Submit label={editing ? "Salvar alterações" : <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
  <p className="font-semibold text-gray-700">
    Tipo da despesa
  </p>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={billForm.recurring === true}
      onChange={() =>
        setBillForm({
          ...billForm,
          recurring: true,
        })
      }
    />

    <span>Mensal recorrente</span>
  </label>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={billForm.recurring === false}
      onChange={() =>
        setBillForm({
          ...billForm,
          recurring: false,
        })
      }
    />

    <span>Somente este mês</span>
  </label>
</div>"Salvar conta"} />{editing && <button type="button" onClick={cancelEdit} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">Cancelar edição</button>}</form></FormCard>;
}

function ExpenseForm({ form, setForm, onSubmit, companies, categories }) {
  return <FormCard title="Nova despesa" subtitle="Cadastre um gasto avulso."><form onSubmit={onSubmit} className="space-y-4"><Input label="Descrição" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: Compra de armações" /><Input label="Valor" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="Ex: 2500" /><Input label="Data" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Select label="Empresa" value={form.company} options={companies} onChange={(v) => setForm({ ...form, company: v })} /><Select label="Categoria" value={form.category} options={categories} onChange={(v) => setForm({ ...form, category: v })} /></div><Submit label="Salvar despesa" /></form></FormCard>;
}

function RevenueForm({ form, setForm, onSubmit, companies }) {
  return <FormCard title="Nova receita" subtitle="Cadastre uma entrada de dinheiro."><form onSubmit={onSubmit} className="space-y-4"><Input label="Descrição" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Ex: Vendas do dia" /><Input label="Valor" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="Ex: 4300" /><Input label="Data" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Select label="Empresa" value={form.company} options={companies} onChange={(v) => setForm({ ...form, company: v })} /><Select label="Forma de recebimento" value={form.method} options={methods} onChange={(v) => setForm({ ...form, method: v })} /></div><Submit label="Salvar receita" /></form></FormCard>;
}

function Companies({ companies, setCompanies, bills, expenses, newCompany, setNewCompany, addCompany }) {
  return <section className="bg-white rounded-3xl p-6 shadow-sm"><div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6"><div><h2 className="text-2xl font-bold">Empresas</h2><p className="text-gray-500">Separe seus gastos por negócio.</p></div><form onSubmit={addCompany} className="flex gap-2"><input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Nova empresa" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none" /><button className="bg-blue-950 text-white px-4 py-3 rounded-2xl font-semibold">Adicionar</button></form></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{companies.map((company) => { const total = bills.filter((b) => b.company === company).reduce((s, i) => s + i.amount, 0) + expenses.filter((e) => e.company === company).reduce((s, i) => s + i.amount, 0); return <div key={company} className="bg-gray-50 rounded-2xl px-5 py-4 flex justify-between gap-3"><div><strong>{company}</strong><p className="text-gray-500 text-sm mt-1">Despesas cadastradas: {money(total)}</p></div><button onClick={() => setCompanies(companies.filter((c) => c !== company))} className="text-red-500 text-sm">Excluir</button></div>; })}</div></section>;
}

function Categories({ categories, setCategories, newCategory, setNewCategory, addCategory }) {
  return <section className="bg-white rounded-3xl p-6 shadow-sm"><div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6"><div><h2 className="text-2xl font-bold">Categorias</h2><p className="text-gray-500">Organize melhor seus gastos.</p></div><form onSubmit={addCategory} className="flex gap-2"><input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none" /><button className="bg-blue-950 text-white px-4 py-3 rounded-2xl font-semibold">Adicionar</button></form></div><div className="flex flex-wrap gap-3">{categories.map((category) => <div key={category} className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3"><strong>{category}</strong><button onClick={() => setCategories(categories.filter((c) => c !== category))} className="text-red-500 text-sm">×</button></div>)}</div></section>;
}

function Reports({ totals, bills, expenses }) {
  const categoryTotals = [...bills, ...expenses].reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + item.amount; return acc; }, {});
  const companyTotals = [...bills, ...expenses].reduce((acc, item) => { acc[item.company] = (acc[item.company] || 0) + item.amount; return acc; }, {});
  const biggest = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const maxCategory = Math.max(...Object.values(categoryTotals), 1);
  const maxCompany = Math.max(...Object.values(companyTotals), 1);
  return <section className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><Card title="Receita total" value={money(totals.revenue)} color="text-green-600" /><Card title="Despesa total" value={money(totals.totalExpenses)} color="text-red-500" /><Card title="Saldo previsto" value={money(totals.forecast)} color={totals.forecast >= 0 ? 'text-blue-700' : 'text-red-600'} /><Card title="Maior categoria" value={biggest ? biggest[0] : '-'} color="text-blue-700" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ReportBox title="Gastos por categoria" items={categoryTotals} max={maxCategory} /><ReportBox title="Gastos por empresa" items={companyTotals} max={maxCompany} /></div></section>;
}

function ReportBox({ title, items, max }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <div className="bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-xl font-bold mb-4">{title}</h2><Empty text="Sem dados para exibir." /></div>;
  return <div className="bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-xl font-bold mb-4">{title}</h2><div className="space-y-4">{entries.map(([name, value]) => <div key={name}><div className="flex justify-between text-sm mb-2"><strong>{name}</strong><span>{money(value)}</span></div><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-950 rounded-full" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div></div>)}</div></div>;
}

function InstallApp({ currentMonth, totals }) {
  function printReport() { window.print(); }
  return <section className="space-y-6"><div className="bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-2xl font-bold mb-1">Instalar e testar</h2><p className="text-gray-500 mb-6">Use o My Finance como aplicativo no celular quando ele estiver publicado.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Card title="Mês atual" value={currentMonth} color="text-blue-700" /><Card title="Saldo previsto" value={money(totals.forecast)} color={totals.forecast >= 0 ? 'text-blue-700' : 'text-red-600'} /><Card title="Pendentes" value={money(totals.pendingBills)} color="text-yellow-500" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 rounded-2xl p-5"><strong className="block text-lg mb-2">No Android</strong><p className="text-gray-500 text-sm">Abra o link no Chrome, toque nos três pontos e escolha “Adicionar à tela inicial”.</p></div><div className="bg-gray-50 rounded-2xl p-5"><strong className="block text-lg mb-2">No iPhone</strong><p className="text-gray-500 text-sm">Abra no Safari, toque em compartilhar e escolha “Adicionar à Tela de Início”.</p></div></div><button onClick={printReport} className="mt-6 bg-blue-950 text-white px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition">Imprimir resumo financeiro</button></div></section>;
}

function Goals({ goals, setGoals, goalForm, setGoalForm }) {
  function addGoal(e) {
    e.preventDefault();
    if (!goalForm.title || !goalForm.target) return;
    setGoals([...goals, { id: Date.now(), title: goalForm.title, target: Number(goalForm.target), current: Number(goalForm.current || 0) }]);
    setGoalForm({ title: '', target: '', current: '' });
  }
  return <section className="space-y-6"><div className="bg-white rounded-3xl p-6 shadow-sm"><h2 className="text-2xl font-bold mb-1">Metas financeiras</h2><p className="text-gray-500 mb-6">Acompanhe seus objetivos financeiros.</p><form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Nome da meta" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" /><input type="number" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} placeholder="Valor alvo" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" /><input type="number" value={goalForm.current} onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })} placeholder="Valor atual" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none" /><button className="bg-blue-950 text-white rounded-2xl font-bold px-4 py-4">Adicionar meta</button></form><div className="space-y-5">{goals.map((goal) => { const progress = Math.min(100, (goal.current / goal.target) * 100); return <div key={goal.id} className="bg-gray-50 rounded-2xl p-5"><div className="flex justify-between gap-4 mb-3"><div><strong className="block text-lg">{goal.title}</strong><span className="text-sm text-gray-500">{money(goal.current)} de {money(goal.target)}</span></div><button onClick={() => setGoals(goals.filter((g) => g.id !== goal.id))} className="text-red-500 text-sm">Excluir</button></div><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.max(progress, 4)}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span className="text-gray-500">Progresso</span><strong>{progress.toFixed(1)}%</strong></div></div>; })}</div></div></section>;
}

function Settings({ darkMode, setDarkMode, notificationsEnabled, setNotificationsEnabled, bills, exportBackup, importBackup }) {
  const pending = bills.filter((b) => b.status !== 'Pago').length;
  return <section className="bg-white rounded-3xl p-6 shadow-sm max-w-3xl mx-auto space-y-6"><div><h2 className="text-2xl font-bold">Configurações</h2><p className="text-gray-500">Personalize sua experiência no My Finance.</p></div><div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between gap-4"><div><strong className="block">Modo escuro</strong><p className="text-sm text-gray-500">Visual mais confortável para uso noturno.</p></div><button onClick={() => setDarkMode(!darkMode)} className={`px-5 py-3 rounded-2xl font-semibold ${darkMode ? 'bg-blue-950 text-white' : 'bg-white border border-gray-200'}`}>{darkMode ? 'Ativado' : 'Desativado'}</button></div><div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between gap-4"><div><strong className="block">Notificações</strong><p className="text-sm text-gray-500">Receba alertas de contas próximas do vencimento.</p></div><button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`px-5 py-3 rounded-2xl font-semibold ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-white border border-gray-200'}`}>{notificationsEnabled ? 'Ativadas' : 'Desativadas'}</button></div><div className="bg-gray-50 rounded-2xl p-5 space-y-3"><strong className="block">Backup e restauração</strong><p className="text-sm text-gray-500">Salve uma cópia completa dos seus dados ou restaure em outro navegador.</p><div className="flex flex-wrap gap-3"><button onClick={exportBackup} className="bg-blue-950 text-white px-5 py-3 rounded-2xl font-semibold">Baixar backup</button><label className="bg-white border border-gray-200 px-5 py-3 rounded-2xl font-semibold cursor-pointer">Importar backup<input type="file" accept="application/json" onChange={importBackup} className="hidden" /></label></div></div><div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-5"><strong className="block text-yellow-800">Resumo financeiro</strong><p className="text-yellow-700 mt-2">Você possui atualmente {pending} contas pendentes no sistema.</p></div></section>;
}

function Tab({ id, label, active, setTab }) { return <button onClick={() => setTab(id)} className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap transition ${active ? 'bg-blue-950 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>{label}</button>; }
function ActionButton({ label, onClick, color }) { const classes = color === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' : color === 'white' ? 'bg-white text-blue-950 hover:bg-blue-50' : color === 'dark' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-blue-700 hover:bg-blue-800 text-white'; return <button onClick={onClick} className={`${classes} transition px-4 py-3 rounded-2xl font-semibold shadow-lg`}>{label}</button>; }
function Card({ title, value, color }) { return <div className="bg-white rounded-3xl p-5 shadow-sm"><p className="text-gray-500 text-sm">{title}</p><h2 className={`text-2xl md:text-3xl font-bold mt-2 ${color}`}>{value}</h2></div>; }
function ListSection({ title, subtitle, right, children }) { return <section className="bg-white rounded-3xl p-6 shadow-sm"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"><div><h2 className="text-2xl font-bold">{title}</h2><p className="text-gray-500">{subtitle}</p></div><div className="bg-blue-50 rounded-2xl px-5 py-3 text-blue-800 font-semibold">{right}</div></div>{children}</section>; }
function FormCard({ title, subtitle, children }) { return <section className="bg-white rounded-3xl p-6 shadow-sm max-w-2xl mx-auto"><h2 className="text-2xl font-bold mb-1">{title}</h2><p className="text-gray-500 mb-6">{subtitle}</p>{children}</section>; }
function formatReal(value) {
  const numbers = String(value).replace(/\D/g, '');
  const amount = Number(numbers) / 100;

  if (!numbers) return '';

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  const isMoney = label === 'Valor' || label === 'Limite' || label === 'Usado' || label === 'Valor alvo' || label === 'Valor atual';

  return (
    <label className="block">
      <span className="font-semibold text-gray-700">{label}</span>
      <input
        type="text"
        value={isMoney ? formatReal(value) : value}
        onChange={(e) => {
          if (isMoney) {
            onChange(e.target.value.replace(/\D/g, ''));
          } else {
            onChange(let formatted = e.target.value;

if (type !== 'number') {
  formatted = formatted.replace(/\b\w/g, (l) => l.toUpperCase());
}

onChange(formatted););
          }
        }}
        placeholder={placeholder}
        className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 transition"
      />
    </label>
  );
}
function Select({ label, value, options, onChange }) { return <label className="block"><span className="font-semibold text-gray-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 transition">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function Submit({ label }) { return <button className="w-full bg-blue-950 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition">{label}</button>; }
function Info({ label, value }) { return <div className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"><span className="text-gray-500">{label}</span><strong>{value}</strong></div>; }
function Empty({ text }) { return <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500">{text}</div>; }
