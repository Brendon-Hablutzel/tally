import { Link } from "react-router";
import { getAllSchools } from "../util/schools";

function App() {
  const schools = getAllSchools();

  return (
    <div className="p-4 flex flex-col gap-2 items-center">
      <div className="flex flex-col gap-3 text-center mb-4">
        <h1 className="text-5xl">
          <Link to="/">Tally</Link>
        </h1>
        <h3 className="text-xl">
          View insights for your university dining plan based on your
          transaction history
        </h3>
      </div>
      <div className="flex flex-col items-center gap-2 p-2 rounded-lg w-[90%] max-w-[850px]">
        <div className="flex gap-3">
          {schools.map((school) => (
            <Link
              key={school.id}
              to={`/${school.id}`}
              className={`text-xl text-center w-[200px] bg-gray-200 hover:${school.colors.bg} rounded-lg py-1 px-2 hover:cursor-pointer hover:text-white transition ease-in duration-200`}
            >
              {school.displayName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
