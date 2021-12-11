import './Modal.scss';
import {useRecoilState, useRecoilValue} from "recoil";
import {modalState} from "../../atoms";

export default function Modal() {
    const [modal, setModal] = useRecoilState(modalState);

    const closeModal = () => {
        if (modal.closable) {
            setModal({
                ...modal,
                isOpen: false,
            });
        }
    };

    return (
        <div onClick={closeModal} className={`modal ${modal.isOpen ? 'open' : ''}`}>
            <div onClick={e => e.stopPropagation()} className={'modal_content'}>
                {modal.content}
            </div>
        </div>
    );
}