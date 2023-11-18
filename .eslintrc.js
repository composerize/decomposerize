module.exports = {
  root: true,
  extends: ["airbnb-base",'react-app','prettier'],
  plugins: ["prettier"],
  rules: {
    // TODO: Add typescript types to decomposerize-website
    "react/prop-types": "off",
	"import/no-anonymous-default-export":"off"
  }
};
