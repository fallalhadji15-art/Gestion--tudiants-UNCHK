let students = [
      {
        id: 1,
        nom: "Fall",
        prenom: "Elhadji",
        email: "fallalhadji@gmail.com",
        classe: "Licence 1",
        note: 20
      }
    ];

    let editingId = null;

    const studentForm = document.getElementById('student-form');
    const formTitle = document.getElementById('form-title');
    const btnSubmitText = document.getElementById('btn-submit-text');
    const successMsg = document.getElementById('success-msg');
    const studentTableBody = document.getElementById('student-table-body');
    const searchInput = document.getElementById('search-input');
    const filterClasse = document.getElementById('filter-classe');
    const sortSelect = document.getElementById('sort-select');
    const btnExport = document.getElementById('btn-export');

    const statTotal = document.getElementById('stat-total');
    const statMoyenne = document.getElementById('stat-moyenne');
    const statTaux = document.getElementById('stat-taux');
    const statMajor = document.getElementById('stat-major');

    document.addEventListener('DOMContentLoaded', () => {
      renderApp();
    });

    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nom = document.getElementById('nom').value.trim();
      const prenom = document.getElementById('prenom').value.trim();
      const email = document.getElementById('email').value.trim();
      const classe = document.getElementById('classe').value.trim();
      const note = parseFloat(document.getElementById('note').value);

      if (editingId !== null) {
        students = students.map(st => {
          if (st.id === editingId) {
            return { id: editingId, nom, prenom, email, classe, note };
          }
          return st;
        });
        editingId = null;
        formTitle.textContent = "Ajouter un étudiant";
        btnSubmitText.textContent = "Ajouter l'étudiant";
      } else {
        const newStudent = {
          id: Date.now(),
          nom,
          prenom,
          email,
          classe,
          note
        };
        students.push(newStudent);
      }

      studentForm.reset();
      showSuccessFeedback();
      renderApp();
    });

    function showSuccessFeedback() {
      successMsg.style.display = 'inline';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 3000);
    }

    window.deleteStudent = function(id) {
      if (confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
        students = students.filter(st => st.id !== id);
        renderApp();
      }
    }

    window.editStudent = function(id) {
      const student = students.find(st => st.id === id);
      if (student) {
        document.getElementById('student-id').value = student.id;
        document.getElementById('nom').value = student.nom;
        document.getElementById('prenom').value = student.prenom;
        document.getElementById('email').value = student.email;
        document.getElementById('classe').value = student.classe;
        document.getElementById('note').value = student.note;

        editingId = student.id;
        formTitle.textContent = "Modifier l'étudiant";
        btnSubmitText.textContent = "Mettre à jour";
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }

    searchInput.addEventListener('input', renderTable);
    filterClasse.addEventListener('change', renderTable);
    sortSelect.addEventListener('change', renderTable);

    function renderApp() {
      updateClassFilterOptions();
      renderTable();
      updateStats();
    }

    function updateClassFilterOptions() {
      const currentSelected = filterClasse.value;
      const classesSet = [...new Set(students.map(st => st.classe))].sort();
      
      filterClasse.innerHTML = `<option value="ALL">Toutes les classes</option>`;
      classesSet.forEach(c => {
        const selectedAttr = c === currentSelected ? 'selected' : '';
        filterClasse.innerHTML += `<option value="${c}" ${selectedAttr}>${c}</option>`;
      });
    }

    function renderTable() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedClass = filterClasse.value;
      const sortBy = sortSelect.value;

      let filtered = students.filter(st => {
        const fullName = `${st.prenom} ${st.nom}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm) || st.email.toLowerCase().includes(searchTerm);
        const matchesClass = selectedClass === 'ALL' || st.classe === selectedClass;
        return matchesSearch && matchesClass;
      });

      filtered.sort((a, b) => {
        if (sortBy === 'note-desc') return b.note - a.note;
        if (sortBy === 'note-asc') return a.note - b.note;
        if (sortBy === 'nom-asc') return a.nom.localeCompare(b.nom);
        return 0; 
      });

      if (filtered.length === 0) {
        studentTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Aucun étudiant trouvé.</td></tr>`;
        return;
      }

      studentTableBody.innerHTML = filtered.map(st => {
        const isAdmis = st.note >= 10;
        const badgeClass = isAdmis ? 'badge-success' : 'badge-danger';
        const badgeText = isAdmis ? 'Admis' : 'Ajourné';

        return `
          <tr>
            <td><strong>${st.prenom} ${st.nom}</strong></td>
            <td>${st.email}</td>
            <td>${st.classe}</td>
            <td>${st.note.toFixed(2)}/20</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>
              <button class="btn-action btn-edit" onclick="editStudent(${st.id})">Modifier</button>
              <button class="btn-action btn-delete" onclick="deleteStudent(${st.id})">Supprimer</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function updateStats() {
      const total = students.length;
      statTotal.textContent = total;

      if (total === 0) {
        statMoyenne.textContent = "0,00/20";
        statTaux.textContent = "0%";
        statMajor.textContent = "Aucun";
        return;
      }

      const sumNotes = students.reduce((acc, st) => acc + st.note, 0);
      const moyenneGen = sumNotes / total;
      statMoyenne.textContent = `${moyenneGen.toFixed(2).replace('.', ',')}/20`;

      const admisCount = students.filter(st => st.note >= 10).length;
      const tauxReussite = (admisCount / total) * 100;
      statTaux.textContent = `${tauxReussite.toFixed(0)}%`;

      const major = students.reduce((prev, current) => (prev.note > current.note) ? prev : current);
      statMajor.textContent = `${major.prenom} ${major.nom} (${major.note}/20)`;
    }

    btnExport.addEventListener('click', () => {
      if (students.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,Nom;Prenom;Email;Classe;Note;Resultat\n";

      students.forEach(st => {
        const resultat = st.note >= 10 ? "Admis" : "Ajourné";
        csvContent += `${st.nom};${st.prenom};${st.email};${st.classe};${st.note};${resultat}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "liste_etudiants_unchk.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });