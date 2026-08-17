import { useAppContext } from '../../AppContext';
import CustomButton from '../../component/reusable/CustomButton';
import CustomInput from '../../component/reusable/CustomInput';

const CRMConfig = () => {
  const { showToast } = useAppContext();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">CRM Configuration</h2>
      <div className="flex flex-col gap-4">
        <CustomInput label="Organization Name" defaultValue="TechOnly Education Pvt. Ltd." />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Default Lead Allotment</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
            <option>Round Robin</option>
            <option>Manual</option>
            <option>Load Balanced</option>
          </select>
        </div>
        <CustomInput label="Follow-up Reminder (hours before)" type="number" defaultValue={2} />
        <CustomInput label="Auto Bad Lead After (days unreachable)" type="number" defaultValue={14} />
        <CustomButton variant="primary" onClick={() => showToast('Settings saved!')} className="mt-2">
          Save Configuration
        </CustomButton>
      </div>
    </div>
  );
};

export default CRMConfig;