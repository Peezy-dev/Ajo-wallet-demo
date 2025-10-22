import ajoLogo from "../assets/ajo-logo.svg";
const logo = () => {
  return (
    <div className="flex items-center gap-3">
      <img src={ajoLogo} alt="Ajo Logo" className="h-12 w-auto" />
    </div>
  );
};
export default logo;
