import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { TaskTemplate } from '../types/template';

const MotionCard = motion(Card);

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TaskTemplate[];
  onSelectTemplate: (template: TaskTemplate) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        style={{
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <ModalHeader>Choose a Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={2} spacing={4}>
            {templates.map((template) => (
              <MotionCard
                key={template.id}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                cursor="pointer"
                onClick={() => onSelectTemplate(template)}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "lg"
                }}
                whileTap={{ scale: 0.98 }}
                _hover={{ bg: hoverBg }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Box fontSize="2xl">{template.icon}</Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">{template.name}</Heading>
                      <Text fontSize="sm" color={textColor}>
                        {template.description}
                      </Text>
                      <Text fontSize="xs" color={textColor} mt={2}>
                        {template.tasks.length} tasks
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TemplateModal; 