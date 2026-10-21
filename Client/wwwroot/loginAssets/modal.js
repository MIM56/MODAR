// ============================================
// REPORTS MODAL & FORM FUNCTIONS
// ============================================

// Fungsi untuk load projects ke dropdown
async function loadProjects() {
    const selectElement = document.getElementById('projectId');

    try {
        const response = await fetch(`${API_BASE_URL}/api/ProjectLists`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                redirectToLogin();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        selectElement.innerHTML = '<option selected disabled value="">Choose Project</option>';

        let projects = [];
        if (result.data && Array.isArray(result.data)) {
            projects = result.data;
        } else if (Array.isArray(result)) {
            projects = result;
        }

        if (projects.length > 0) {
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name || project.projectName || `Project ${project.id}`;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        selectElement.innerHTML = `
            <option selected disabled value="">Choose Project</option>
            <option value="1">Project Alpha</option>
            <option value="2">Project Beta</option>
        `;
    }
}

// Fungsi untuk insert report (open modal)
function InsertReport() {
    document.getElementById('headName').innerHTML = '<i class="fas fa-file-alt me-2"></i>Create Report';
    document.getElementById('formModal').reset();
    document.getElementById('formModal').classList.remove('was-validated');

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    const email = getEmailFromJWT();
    const doneByInput = document.getElementById('doneBy');
    doneByInput.value = email;
    doneByInput.readOnly = true;

    loadProjects();
}

// Event handler untuk tombol submit
$('#btnReport').on('click', async function() {
    const form = document.getElementById('formModal');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const btn = $(this);
    const originalText = btn.html();
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Saving...');

    const formData = {
        title: $('#title').val(),
        progressReport: $('#progressReport').val(),
        doneBy: $('#doneBy').val(),
        date: $('#date').val(),
        status: parseInt($('input[name="status"]:checked').val()),
        projectId: parseInt($('#projectId').val()),
        description: $('#description').val()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Reports`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                redirectToLogin();
                return;
            }
        }

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Invalid JSON response from server');
        }

        if (response.ok && (result.statusCode === 200 || result.statusCode === 201)) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Report created successfully',
                confirmButtonColor: '#28a745'
            }).then(() => {
                $('#modalReport').modal('hide');
                loadReports();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: result.message || 'Failed to create report',
                confirmButtonColor: '#e74c3c'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message || 'An error occurred while saving the report',
            confirmButtonColor: '#e74c3c'
        });
    } finally {
        btn.prop('disabled', false).html(originalText);
    }
});