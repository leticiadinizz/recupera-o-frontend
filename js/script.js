const API_BASE_URL = "http://localhost:3000";
const form = document.getElementById("form-professor");
const listaProfessores = document.getElementById("lista-professores");

// Rotas da API
const API_ROUTES = {
  LISTAR: "/listar/professores",
  CADASTRAR: "/cadastro/professores",
  ATUALIZAR: "/atualiza/professores",
  DELETAR: "/deleta/professores"
};

// Função para carregar professores
async function carregarProfessores() {
  try {
    const response = await fetch(API_BASE_URL + API_ROUTES.LISTAR);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const professores = await response.json();
    
    if (!professores || professores.length === 0) {
      listaProfessores.innerHTML = "<p>Nenhum professor cadastrado ainda.</p>";
      return;
    }
    
    listaProfessores.innerHTML = professores.map(professor => `
      <div class="professor-card">
        <h3>${professor.nome_completo}</h3>
        <p><strong>Disciplina:</strong> ${professor.disciplina_ensino || 'Não informada'}</p>
        <p><strong>Formação:</strong> ${professor.nivel_formacao || 'Não informada'}</p>
        <p><strong>Contratado em:</strong> ${formatarData(professor.data_contratacao)}</p>
        <div class="professor-actions">
          <button class="edit-btn" onclick="editarProfessor(${professor.id_professor})">Editar</button>
          <button class="delete-btn" onclick="deletarProfessor(${professor.id_professor})">Excluir</button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error("Erro ao carregar professores:", error);
    listaProfessores.innerHTML = `
      <p class="error-message">Erro ao carregar professores. Verifique o console.</p>
      <button onclick="carregarProfessores()">Tentar novamente</button>
    `;
  }
}

// Função para cadastrar/atualizar professor
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const professor = {
    nome_completo: document.getElementById("nome_completo").value,
    data_contratacao: document.getElementById("data_contratacao").value,
    disciplina_ensino: document.getElementById("disciplina_ensino").value,
    nivel_formacao: document.getElementById("nivel_formacao").value
  };

  const idProfessor = document.getElementById("id_professor").value;
  const url = idProfessor 
    ? `${API_BASE_URL}${API_ROUTES.ATUALIZAR}/${idProfessor}`
    : `${API_BASE_URL}${API_ROUTES.CADASTRAR}`;
  
  const method = idProfessor ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(professor)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    form.reset();
    document.getElementById("id_professor").value = "";
    carregarProfessores();
    abrirTab('lista');
    
  } catch (error) {
    console.error("Erro ao salvar professor:", error);
    alert("Erro ao salvar professor. Verifique o console.");
  }
});

// Função para editar professor
async function editarProfessor(id) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ROUTES.LISTAR}/${id}`);
    const professor = await response.json();

    document.getElementById("id_professor").value = professor.id_professor;
    document.getElementById("nome_completo").value = professor.nome_completo;
    document.getElementById("data_contratacao").value = professor.data_contratacao.split('T')[0];
    document.getElementById("disciplina_ensino").value = professor.disciplina_ensino;
    document.getElementById("nivel_formacao").value = professor.nivel_formacao;
    
    abrirTab('cadastro');
    
  } catch (error) {
    console.error("Erro ao editar professor:", error);
    alert("Erro ao carregar dados do professor.");
  }
}

// Função para excluir professor
async function deletarProfessor(id) {
  if (!confirm("Tem certeza que deseja excluir este professor?")) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ROUTES.DELETAR}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    carregarProfessores();
    
  } catch (error) {
    console.error("Erro ao excluir professor:", error);
    alert("Erro ao excluir professor. Verifique o console.");
  }
}

// Funções auxiliares
function formatarData(dataString) {
  if (!dataString) return 'Data não informada';
  try {
    return new Date(dataString).toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
}

function abrirTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.classList.add('active');
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarProfessores();
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
      abrirTab(tabName);
      if (tabName === 'lista') carregarProfessores();
    });
  });
});