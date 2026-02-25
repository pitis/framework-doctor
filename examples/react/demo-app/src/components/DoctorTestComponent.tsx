interface Props {
  label: string;
}

const DoctorTestComponent = ({ label }: Props) => (
  <button type="button">{label}</button>
);

export default DoctorTestComponent;
