function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tabs-menu div').forEach(menuItem => {
        menuItem.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function openModal(rule = null) {
    const modal = document.getElementById("ruleModal");
    const form = document.getElementById("ruleForm");

    if (rule) {
        document.getElementById('ruleId').value = rule._id;
        document.getElementById('ruleName').value = rule.name;
        document.getElementById('description').value = rule.description;
        document.getElementById('anomalyScore').value = rule.anomalyScore;
        document.getElementById('action').value = rule.action;
        // Populate conditions...
    } else {
        form.reset();
        document.getElementById('ruleId').value = '';
        document.getElementById('conditions').innerHTML = '';
    }

    modal.style.display = "block";
}

function closeModal() {
    document.getElementById("ruleModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("ruleModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addCondition() {
    const conditionTemplate = `
        <div class="condition">
            <!-- Add your condition fields here -->
            <span class="delete-condition" onclick="deleteCondition(this)">x</span>
        </div>`;
    document.getElementById('conditions').insertAdjacentHTML('beforeend', conditionTemplate);
}

function deleteCondition(element) {
    element.parentElement.remove();
}
