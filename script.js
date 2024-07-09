document.addEventListener('DOMContentLoaded', () => {
  const companySelect = document.getElementById('company');
  const additionalFields = document.getElementById('additional-fields');

  companySelect.addEventListener('change', (event) => {
    const company = event.target.value;
    additionalFields.innerHTML = ''; // Clear previous fields

    switch (company) {
      case 'Repsol':
        additionalFields.innerHTML = '<label for="licensePlate">License Plate</label><input type="text" id="licensePlate" name="licensePlate" required>';
        break;
      case 'Rosewood':
        additionalFields.innerHTML = `
          <label for="licensePlate">License Plate</label>
          <input type="text" id="licensePlate" name="licensePlate" required>
          <label for="makeModel">Make and Model</label>
          <input type="text" id="makeModel" name="makeModel" required>
        `;
        break;
      case 'Crimson':
        additionalFields.innerHTML = `
          <label for="licensePlate">License Plate</label>
          <input type="text" id="licensePlate" name="licensePlate" required>
          <label for="testingCompleted">Testing Completed</label>
          <input type="checkbox" id="testingCompleted" name="testingCompleted">
        `;
        break;
      // Add cases for other companies as needed
      default:
        break;
    }
  });

  // Trigger change event to load fields for the initial selection
  const event = new Event('change');
  companySelect.dispatchEvent(event);
});
