import {CardColor, CardValue} from "../../types";
import {MdBlock, MdFlipCameraAndroid} from "react-icons/md";
import React from "react";
import './Card.scss';

interface ICardProps {
    onDrop?: React.DragEventHandler<HTMLDivElement>,
    onDragOver?: React.DragEventHandler<HTMLDivElement>,
    color: CardColor,
    value: CardValue,
    size?: CardSize,
    index: number,
    draggable: boolean,
}

type CardSize = 'small' | 'medium' | 'large';

const cardSegments = <>
    <div className={'card_segment tl'}/>
    <div className={'card_segment tr'}/>
    <div className={'card_segment bl'}/>
    <div className={'card_segment br'}/>
</>;

export default function Card({draggable = true, index = 0, onDrop, onDragOver, color, value, size = 'medium'}: ICardProps) {
    const getRenderedValue = () => {
        switch (value) {
            case 'reverse':
                return <MdFlipCameraAndroid />;
            case 'skip':
                return <MdBlock />;
            case 'pickColor':
                return <>
                    {color === 'black' ? cardSegments : ''}
                </>;
            case '+4':
                return <>
                    {color === 'black' ? cardSegments : ''}
                    <div className={'card_value'}>{value}</div>
                </>;
            case 'none':
                return '';
            default:
                return <>{value}</>;
        }
    };

    const drag = (e: React.DragEvent) => {
        e.dataTransfer.setData('index', index.toString());
    };

    return (
        <div draggable={draggable} onDragStart={drag} onDrop={onDrop} onDragOver={onDragOver} className={`card ${color} ${size}`}>
            {getRenderedValue()}
        </div>
    );
}