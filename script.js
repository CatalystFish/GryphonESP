document.getElementById('company-selection').addEventListener('change', function() {
  const company = this.value;
  const additionalFields = document.getElementById('additional-fields');
  
  // Clear previous fields
  additionalFields.innerHTML = '';
  
  // Add fields based on company
  if (company === 'Repsol') {
    additionalFields.innerHTML = `
      <label for="license-plate">License Plate</label>
      <input type="text" id="license-plate" name="license-plate" required>
    `;
  } else if (company === 'Rosewood') {
    additionalFields.innerHTML = `
      <label for="license-plate">License Plate</label>
      <input type="text" id="license-plate" name="license-plate" required>
      <label for="vehicle-make">Vehicle Make</label>
      <input type="text" id="vehicle-make" name="vehicle-make" required>
      <label for="vehicle-model">Vehicle Model</label>
      <input type="text" id="vehicle-model" name="vehicle-model" required>
    `;
  } else if (company === 'Crimson') {
    additionalFields.innerHTML = `
      <label for="license-plate">License Plate</label>
      <input type="text" id="license-plate" name="license-plate" required>
      <label for="testing-completed">Testing Completed</label>
      <input type="checkbox" id="testing-completed" name="testing-completed">
    `;
  }
  // Add more conditions for other companies as needed
});
