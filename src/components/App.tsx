import { useState } from "react";
import { useNavigate } from "react-router";
import {
  encodeParsedTable,
  parseInputTransactionHistoryTable,
} from "../util/table";
import exampleTable from "../assets/example.txt?raw";

function App() {
  const [transactionHistory, setTransactionHistory] = useState("");

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (transactionHistory.length === 0) {
      setError("Error: must provide transaction history");
      return;
    }

    try {
      const data = parseInputTransactionHistoryTable(transactionHistory);
      navigate(`/report#${encodeParsedTable(data)}`);
    } catch (e) {
      console.error(e);
      setError(`${e}`);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-2 items-center">
      <div className="flex flex-col gap-3 text-center mb-4">
        <h1 className="text-5xl">Tally</h1>
        <h3 className="text-xl">
          View insights for your NCSU dining plan based on your transaction
          history
        </h3>
        <p className="text-xs">
          Navigate to{" "}
          <a
            target="_blank"
            href="https://get.cbord.com/ncsu/full/funds_home.php"
            className="underline"
          >
            CBORD GET
          </a>{" "}
          and log in {">"} Click "View All Transaction History" (under the "My
          Recent Transactions" header) {">"} Select the entire transaction
          history table and copy it
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-2 p-2 border-[1px] border-black/30 rounded-lg w-[90%] max-w-[850px]"
      >
        <textarea
          placeholder="Copy your transaction history table and paste it here..."
          className="border-black/20 border-[1px] rounded-lg w-[100%] h-[500px] p-2 min-h-12"
          value={transactionHistory}
          onChange={(e) => {
            setError(null);
            setTransactionHistory(e.target.value);
          }}
        />
        {error ? <div className="text-red-500">{error}</div> : null}
        <div className="flex gap-3">
          <button
            // to prevent it from submitting the form
            type="button"
            onClick={() => setTransactionHistory(exampleTable)}
            className={`bg-gray-200 max-w-[200px] rounded-lg py-1 px-2 hover:cursor-pointer transition ease-out duration-150 ${
              transactionHistory.length > 0 ? "text-gray-500" : ""
            }`}
          >
            Load Example
          </button>
          <button
            type="submit"
            className={`bg-gray-200 max-w-[200px] rounded-lg py-1 px-2 hover:cursor-pointer transition ease-in duration-150 ${
              transactionHistory.length > 0 ? "bg-red-400 text-white" : ""
            }`}
          >
            Generate Report
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
