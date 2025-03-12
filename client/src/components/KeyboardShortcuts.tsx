import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

/**
 * Represents a keyboard shortcut with its action and key combination
 */
interface Shortcut {
  /** The action that will be performed */
  action: string;
  /** Array of keys that need to be pressed */
  keys: string[];
}

/**
 * Props for the KeyboardShortcuts component
 */
interface KeyboardShortcutsProps {
  /** Whether the shortcuts modal is open */
  isOpen: boolean;
  /** Callback to close the shortcuts modal */
  onClose: () => void;
}

/**
 * List of available keyboard shortcuts in the application
 */
const shortcuts: Shortcut[] = [
  { action: 'Undo', keys: ['⌘/Ctrl', 'Z'] },
  { action: 'Redo', keys: ['⌘/Ctrl', 'Shift', 'Z'] },
  { action: 'Edit Task', keys: ['Double Click'] },
  { action: 'Save Edit', keys: ['Enter'] },
  { action: 'Cancel Edit', keys: ['Esc'] },
  { action: 'Show Shortcuts', keys: ['?'] },
  { action: 'Next Status', keys: ['→'] },
  { action: 'Previous Status', keys: ['←'] },
];

/**
 * KeyboardShortcuts component displays a modal with all available keyboard shortcuts.
 * The modal can be opened by pressing the '?' key or through a button click.
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Action</Th>
                <Th>Shortcut</Th>
              </Tr>
            </Thead>
            <Tbody>
              {shortcuts.map(({ action, keys }) => (
                <Tr key={action}>
                  <Td>{action}</Td>
                  <Td>
                    {keys.map((key, index) => (
                      <React.Fragment key={key}>
                        <Text
                          as="span"
                          px={2}
                          py={1}
                          borderRadius="md"
                          bg={borderColor}
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          {key}
                        </Text>
                        {index < keys.length - 1 && <Text as="span" mx={1}>+</Text>}
                      </React.Fragment>
                    ))}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default KeyboardShortcuts; 