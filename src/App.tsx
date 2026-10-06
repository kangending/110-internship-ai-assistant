import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { CorrectionDialog } from "./components/CorrectionDialog";
import { SupplementDrawer } from "./components/SupplementDrawer";
import { CurrentActionPage } from "./pages/CurrentActionPage";
import { CreateDiagnosisPage } from "./pages/CreateDiagnosisPage";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { HomePage } from "./pages/HomePage";
import { UnderstandingPage } from "./pages/UnderstandingPage";
import { useHashRoute } from "./components/useHashRoute";
import { useAssessment } from "./state/useAssessment";

function App() {
  const route = useHashRoute();
  const assessment = useAssessment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [supplementOpen, setSupplementOpen] = useState(false);
  const page = {
    home: <HomePage assessment={assessment} />,
    create: <CreateDiagnosisPage assessment={assessment} />,
    understanding: (
      <UnderstandingPage
        assessment={assessment}
        onCorrect={() => setDialogOpen(true)}
        onSupplement={() => setSupplementOpen(true)}
      />
    ),
    diagnosis: (
      <DiagnosisPage
        assessment={assessment}
        onCorrect={() => setDialogOpen(true)}
      />
    ),
    action: <CurrentActionPage assessment={assessment} />,
  }[route];
  return (
    <AppLayout activeRoute={route} assessment={assessment}>
      {page}
      {dialogOpen && (
        <CorrectionDialog
          onClose={() => setDialogOpen(false)}
          onSave={(note) => {
            setDialogOpen(false);
            assessment.applyCorrection(note);
          }}
        />
      )}
      {supplementOpen && (
        <SupplementDrawer
          initial={assessment.supplementSelections}
          locked={assessment.corrected ? ["threads", "mysql"] : []}
          onClose={() => setSupplementOpen(false)}
          onSave={(value) => {
            assessment.saveSupplements(value);
            setSupplementOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}

export default App;
