import { useState } from "react";
import { useNavigate } from "react-router";
import {
  encodeParsedTable,
  parseInputTransactionHistoryTable,
} from "../util/table";

function App() {
  const [transactionHistory, setTransactionHistory] = useState("");

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-5xl">Tally</h1>
        <h3 className="text-lg">
          View insights for your NCSU dining plan based on your transaction
          history
        </h3>
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
        <button
          type="submit"
          className="bg-gray-200 w-[100%] max-w-[200px] rounded-lg p-1 hover:cursor-pointer"
        >
          Generate Report
        </button>
      </form>
    </div>
  );
}

export default App;
