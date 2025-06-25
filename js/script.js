const API_BASE_URL = "http://localhost:3000";
const API_ROUTES = {
  LISTAR: "/listar/professores",
  CADASTRAR: "/cadastro/professores",
  ATUALIZAR: "/atualiza/professores",
  DELETAR: "/deleta/professores"  
};

// Elementos do DOM
const form = document.getElementById("form-professor");
const listaProfessores = document.getElementById("lista-professores");
const idField = document.getElementById("id_professor");

// Ao carregar a pagina, busca lista e configura abas
document.addEventListener("DOMContentLoaded", () => {
  carregarProfessores();
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const alvo = btn.getAttribute('onclick')?.match(/'([^']+)'/)[1];
      if (alvo === 'lista') carregarProfessores();
    });
  });
});

// Listagem
async function carregarProfessores() {
  listaProfessores.innerHTML = '<p>Carregando...</p>';
  try {
    const res = await fetch(API_BASE_URL + API_ROUTES.LISTAR);
    if (!res.ok) throw new Error(res.status);
    const arr = await res.json();
    if (!arr.length) {
      listaProfessores.innerHTML = '<p>Nenhum professor cadastrado.</p>';
      return;
    }
    
    listaProfessores.innerHTML = arr.map(p => `
      <div class="professor-card">
        <h3>${p.nome_completo}</h3>
        <p><strong>Disciplina:</strong> ${p.disciplina_ensino || '—'}</p>
        <p><strong>Formação:</strong> ${p.nivel_formacao || '—'}</p>
        <p><strong>Contratado:</strong> ${formatarData(p.data_contratacao)}</p>
        <div class="professor-actions">
          <button class="edit-btn" data-id="${p.id_professor}">Editar</button>
          <button class="delete-btn" data-id="${p.id_professor}">Excluir</button>
        </div>
      </div>
    `).join('');

    //Ações dos botões
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => editarProfessor(btn.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deletarProfessor(btn.dataset.id)));

  } catch (err) {
    console.error(err);
    listaProfessores.innerHTML = `
      <p class="error-message">Erro ao carregar: ${err.message}</p>
      <button onclick="carregarProfessores()">Tentar novamente</button>
    `;
  }
}

// Cadastrar/atualizar
form.addEventListener('submit', async e => {
  e.preventDefault();
  const professor = {
    nome_completo: document.getElementById('nome_completo').value.trim(),
    data_contratacao: document.getElementById('data_contratacao').value,
    disciplina_ensino: document.getElementById('disciplina_ensino').value.trim(),
    nivel_formacao: document.getElementById('nivel_formacao').value.trim()
  };
  const id = idField.value;
  const url = id
    ? `${API_BASE_URL}${API_ROUTES.ATUALIZAR}/${id}`  // PUT /:id
    : `${API_BASE_URL}${API_ROUTES.CADASTRAR}`;    // POST
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professor)
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    idField.value = '';
    abrirTab('lista');
    carregarProfessores();
  } catch (err) {
    console.error('Erro ao salvar:', err);
    alert('Erro ao salvar professor');
  }
});

//Editar
async function editarProfessor(id) {
  try {
    const res = await fetch(API_BASE_URL + API_ROUTES.LISTAR);
    if (!res.ok) throw new Error("Erro ao buscar professores");
    const professores = await res.json();
    const p = professores.find(x => x.id_professor == id);
    if (!p) throw new Error("Professor não encontrado");

    idField.value = p.id_professor;
    document.getElementById('nome_completo').value = p.nome_completo;
    document.getElementById('data_contratacao').value = p.data_contratacao.split('T')[0];
    document.getElementById('disciplina_ensino').value = p.disciplina_ensino;
    document.getElementById('nivel_formacao').value = p.nivel_formacao;
    abrirTab('cadastro');
  } catch (err) {
    console.error('Erro ao carregar professor:', err);
    alert('Falha ao carregar para edição');
  }
}


// Deletar 
async function deletarProfessor(id) {
  if (!confirm('Deseja mesmo apagar?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}${API_ROUTES.DELETAR}/${id}`, {
      method: 'PUT', // <-- usa PUT como definido no backend
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(res.status);
    carregarProfessores();
  } catch (err) {
    console.error('Excluir falhou:', err);
    alert('Erro ao excluir');
  }
}

// Função para alternar abas
function abrirTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  document.getElementById(tabName).style.display = 'block';
  const btn = Array.from(document.querySelectorAll('.tab-button')).find(b => b.getAttribute('onclick')?.includes(`'${tabName}'`));
  if (btn) btn.classList.add('active');
}

// Formata data para DD/MM/AAAA
function formatarData(d) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : 'N/D';
}
