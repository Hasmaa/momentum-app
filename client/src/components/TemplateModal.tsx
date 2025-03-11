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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Badge,
  Divider,
  Button,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskTemplate, getCategoryInfo } from '../types/template';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

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
  const accentColor = useColorModeValue('blue.500', 'blue.200');
  const tabBg = useColorModeValue('gray.50', 'gray.700');
  const selectedTabBg = useColorModeValue('white', 'gray.600');

  // Group templates by category
  const categories = Array.from(new Set(templates.map(t => t.category)));
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = templates.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, TaskTemplate[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        maxH="85vh"
        overflowY="auto"
      >
        <ModalHeader>
          <HStack spacing={3}>
            <Text>✨ Choose a Template</Text>
            <Text color={textColor} fontSize="sm" fontWeight="normal">
              Streamline your workflow with our curated templates
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList mb={4} p={1} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="full">
              {categories.map(category => {
                const info = getCategoryInfo(category);
                return (
                  <Tab
                    key={category}
                    borderRadius="full"
                    _selected={{ 
                      bg: cardBg,
                      color: accentColor,
                      boxShadow: 'sm'
                    }}
                    color={textColor}
                    _hover={{
                      color: accentColor
                    }}
                  >
                    <HStack spacing={2}>
                      <Text>{info.icon}</Text>
                      <Text>{info.name}</Text>
                      <Badge 
                        colorScheme="blue" 
                        borderRadius="full"
                        variant="subtle"
                      >
                        {templatesByCategory[category].length}
                      </Badge>
                    </HStack>
                  </Tab>
                );
              })}
            </TabList>
            <TabPanels>
              {categories.map(category => {
                const info = getCategoryInfo(category);
                return (
                  <TabPanel key={category} p={0}>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontSize="sm" color={textColor} mb={4}>
                          {info.description}
                        </Text>
                        <Divider mb={4} />
                      </Box>
                      <SimpleGrid columns={2} spacing={4}>
                        {templatesByCategory[category].map((template) => (
                          <MotionCard
                            key={template.id}
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="lg"
                            cursor="pointer"
                            whileHover={{ 
                              scale: 1.02,
                              boxShadow: "lg"
                            }}
                            whileTap={{ scale: 0.98 }}
                            _hover={{ bg: hoverBg }}
                            position="relative"
                            overflow="hidden"
                          >
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              h="3px"
                              bg={accentColor}
                              opacity={0}
                              transition="all 0.2s"
                            />
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <HStack spacing={3} width="100%" justify="space-between">
                                  <Box fontSize="2xl">{template.icon}</Box>
                                  <Badge
                                    colorScheme="blue"
                                    variant="subtle"
                                    borderRadius="full"
                                  >
                                    {template.tasks.length} tasks
                                  </Badge>
                                </HStack>
                                <VStack align="start" spacing={2}>
                                  <Heading size="sm">{template.name}</Heading>
                                  <Text fontSize="sm" color={textColor}>
                                    {template.description}
                                  </Text>
                                </VStack>
                                <VStack align="stretch" spacing={3} mt={4}>
                                  <Divider />
                                  <Text fontSize="sm" fontWeight="medium">
                                    Tasks included:
                                  </Text>
                                  {template.tasks.map((task, index) => (
                                    <HStack key={index} spacing={3}>
                                      <Text fontSize="sm" color={textColor}>
                                        {index + 1}.
                                      </Text>
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {task.title}
                                        </Text>
                                        {task.description && (
                                          <Text fontSize="xs" color={textColor}>
                                            {task.description}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  ))}
                                  <Button
                                    colorScheme="blue"
                                    size="sm"
                                    width="100%"
                                    onClick={() => onSelectTemplate(template)}
                                  >
                                    Use This Template
                                  </Button>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </MotionCard>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                );
              })}
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TemplateModal; 