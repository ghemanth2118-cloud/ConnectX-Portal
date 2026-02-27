
try {
  require('./routes/jobRoutes');
  console.log('SUCCESS: jobRoutes.js loaded without error');
} catch (error) {
  console.error('FAILURE: jobRoutes.js failed to load');
  console.error(error);
}
