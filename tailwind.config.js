const { uniformMeshPlugin } = require('@uniformdev/mesh-sdk-react/tailwind');

module.exports = {
  content: ['./pages/**/*.js', './components/**/*.js'],
  plugins: [require('@tailwindcss/forms'), uniformMeshPlugin],
};
