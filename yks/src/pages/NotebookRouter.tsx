import NotebookEditorPage from './NotebookEditorPage';
import NotebookPage from './NotebookPage';

/** /defterim → sayfa listesi, /defterim/:id → çizim editörü. */
export default function NotebookRouter({ params }: { params: string[] }) {
  return params[0] ? <NotebookEditorPage params={params} /> : <NotebookPage />;
}
