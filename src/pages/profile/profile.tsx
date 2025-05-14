import 'tippy.js/dist/tippy.css';

import PasswordFormLogic from './passwordformLogic';
import FormUserDateLogic from './userDateformLogic';

const Index = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormUserDateLogic></FormUserDateLogic>
            <PasswordFormLogic></PasswordFormLogic>
        </div>
    );
};

export default Index;
