import { BoardProvider } from "../state/BoardContext";
import { BoardPage } from "../pages/BoardPage";

export const App = (): JSX.Element => {
  return (
    <BoardProvider>
      <BoardPage />
    </BoardProvider>
  );
};
