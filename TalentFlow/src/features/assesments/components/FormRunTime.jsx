import AssessmentPreview from './AssessmentPreview';

const FormRunTime = ({ assessment, onComplete }) => {
  return (
    <AssessmentPreview 
      assessment={assessment}
      mode="runtime"
      onBack={() => onComplete?.()}
    />
  );
};

export default FormRunTime;
