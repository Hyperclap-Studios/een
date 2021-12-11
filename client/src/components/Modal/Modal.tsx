import './Modal.scss';
import {useRecoilState, useRecoilValue} from "recoil";
import {modalContentState, modalOpenState} from "../../atoms";

export default function Modal() {
    const content = useRecoilValue(modalContentState);
    const [open, setOpen] = useRecoilState(modalOpenState);

    const closeModal = () => {
        setOpen(false);
    };

    return (
        <div onClick={closeModal} className={`modal ${open ? 'open' : ''}`}>
            <div onClick={e => e.stopPropagation()} className={'modal_content'}>
                {content}
            </div>
        </div>
    );
}