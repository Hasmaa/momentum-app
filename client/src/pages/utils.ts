import { CheckIcon, TimeIcon, WarningIcon } from "@chakra-ui/icons";
import { Task } from "../types";
import { CollisionDetection, pointerWithin, DroppableContainer } from "@dnd-kit/core";


export const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return CheckIcon;
    case 'in-progress':
      return TimeIcon;
    case 'pending':
      return WarningIcon;
  }
};// Update the custom collision detection function to match the correct types
export const customCollisionDetection: CollisionDetection = ({
  active, collisionRect, droppableRects, droppableContainers, pointerCoordinates,
}) => {
  if (!pointerCoordinates) return [];

  // First, check for direct collisions with items
  const pointerCollisions = pointerWithin({
    active,
    collisionRect,
    droppableRects,
    droppableContainers,
    pointerCoordinates,
  });

  // Get all item collisions (non-column containers)
  const itemCollisions = pointerCollisions.filter(collision => !collision.id.toString().startsWith('column-') && collision.id !== active.id
  );

  // Get all column collisions
  const columnCollisions = pointerCollisions.filter(collision => collision.id.toString().startsWith('column-')
  );

  // If we have an item collision, prioritize it
  if (itemCollisions.length > 0) {
    return [itemCollisions[0]];
  }

  // If we have a column collision, use it
  if (columnCollisions.length > 0) {
    return [columnCollisions[0]];
  }

  // If no direct collisions, find the nearest column
  const columnContainers = droppableContainers.filter(container => container.id.toString().startsWith('column-')
  );

  let closestColumn: DroppableContainer | null = null;
  let minDistance = Infinity;

  for (const container of columnContainers) {
    const rect = droppableRects.get(container.id);
    if (rect) {
      // Calculate distance to the column's center
      const columnCenterX = rect.left + rect.width / 2;
      const columnCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(pointerCoordinates.x - columnCenterX, 2) +
        Math.pow(pointerCoordinates.y - columnCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColumn = container;
      }
    }
  }

  return closestColumn ? [{ id: closestColumn.id }] : [];
};

