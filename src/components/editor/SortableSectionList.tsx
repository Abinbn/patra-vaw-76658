import React from 'react';
import { CardData } from './types';
import { CARD_DEFINITIONS } from './constants';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface SortableSectionListProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const SortableSectionList: React.FC<SortableSectionListProps> = ({ cardData, setCardData }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = cardData.cardOrder.indexOf(active.id as string);
            const newIndex = cardData.cardOrder.indexOf(over.id as string);
            setCardData({ ...cardData, cardOrder: arrayMove(cardData.cardOrder, oldIndex, newIndex) });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Card Layout</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Control which cards appear and their order on your profile
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={cardData.cardOrder} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {cardData.cardOrder.map((cardId) => {
                            const card = CARD_DEFINITIONS.find(c => c.id === cardId);
                            if (!card) return null;
                            const CardIcon = card.icon;

                            return (
                                <SortableItem key={cardId} id={cardId}>
                                    <div className="flex-1 flex items-center justify-between p-3 border rounded-lg bg-card">
                                        <div className="flex items-center gap-3">
                                            <CardIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{card.label}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCardData({
                                                ...cardData,
                                                cardVisibility: {
                                                    ...cardData.cardVisibility,
                                                    [cardId]: !cardData.cardVisibility[cardId as keyof typeof cardData.cardVisibility]
                                                }
                                            })}
                                        >
                                            {cardData.cardVisibility[cardId as keyof typeof cardData.cardVisibility] ?
                                                <Eye className="w-4 h-4" /> :
                                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                            }
                                        </Button>
                                    </div>
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                    <GripVertical className="w-4 h-4 inline mr-1" />
                    Drag cards to reorder them. Use the eye icon to show/hide cards.
                </p>
            </div>
        </div>
    );
};
