import { useState, useRef, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, X, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your inventory assistant. I can help you with questions about warehouses, products, stock levels, receipts, deliveries, and more. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { products, warehouses, receipts, deliveries, transfers, adjustments, suppliers } = useInventory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const findWarehouse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return warehouses.find(
      w =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.code.toLowerCase().includes(lowerQuery) ||
        w.id.toLowerCase().includes(lowerQuery)
    );
  };

  const findProduct = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.find(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.id.toLowerCase().includes(lowerQuery)
    );
  };

  const getStockLevel = (productId: string, warehouseId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    return product.stock[warehouseId] || 0;
  };

  const parseQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase().trim();

    // Warehouse questions
    if (lowerQuestion.includes('warehouse') || lowerQuestion.includes('warehouses')) {
      if (lowerQuestion.includes('list') || lowerQuestion.includes('all') || lowerQuestion.includes('show')) {
        if (warehouses.length === 0) {
          return "There are no warehouses in the system.";
        }
        let response = `Here are all ${warehouses.length} warehouse(s):\n\n`;
        warehouses.forEach((w, idx) => {
          response += `${idx + 1}. ${w.name} (${w.code})\n   Address: ${w.address}\n\n`;
        });
        return response;
      }

      // Find specific warehouse
      const warehouse = findWarehouse(question);
      if (warehouse) {
        return `Warehouse Details:\n\nName: ${warehouse.name}\nCode: ${warehouse.code}\nAddress: ${warehouse.address}\nID: ${warehouse.id}`;
      }

      return `I found ${warehouses.length} warehouse(s) in the system. You can ask me about a specific warehouse by name or code.`;
    }

    // Product stock questions
    if (lowerQuestion.includes('stock') || lowerQuestion.includes('quantity') || lowerQuestion.includes('inventory')) {
      // Pattern: "stock of product X in warehouse Y"
      const productMatch = lowerQuestion.match(/stock.*product\s+([^\s]+(?:\s+[^\s]+)*?)(?:\s+in|\s+warehouse|$)/i);
      const warehouseMatch = lowerQuestion.match(/(?:in|warehouse)\s+([^\s]+(?:\s+[^\s]+)*?)(?:\s|$)/i);

      let product: typeof products[0] | undefined;
      let warehouse: typeof warehouses[0] | undefined;

      if (productMatch) {
        const productQuery = productMatch[1].trim();
        product = findProduct(productQuery);
      } else {
        // Try to find product in the question
        for (const p of products) {
          if (lowerQuestion.includes(p.name.toLowerCase()) || lowerQuestion.includes(p.sku.toLowerCase())) {
            product = p;
            break;
          }
        }
      }

      if (warehouseMatch) {
        const warehouseQuery = warehouseMatch[1].trim();
        warehouse = findWarehouse(warehouseQuery);
      }

      if (product && warehouse) {
        const stock = getStockLevel(product.id, warehouse.id);
        return `Stock Level:\n\nProduct: ${product.name} (${product.sku})\nWarehouse: ${warehouse.name}\nCurrent Stock: ${stock.toLocaleString()} ${product.unitOfMeasure}`;
      }

      if (product) {
        // Show stock in all warehouses
        const stockInfo = Object.entries(product.stock)
          .map(([whId, qty]) => {
            const wh = warehouses.find(w => w.id === whId);
            return wh ? `${wh.name}: ${qty.toLocaleString()} ${product.unitOfMeasure}` : null;
          })
          .filter(Boolean)
          .join('\n');

        if (stockInfo) {
          return `Stock for ${product.name} (${product.sku}):\n\n${stockInfo}\n\nTotal: ${Object.values(product.stock).reduce((a, b) => a + b, 0).toLocaleString()} ${product.unitOfMeasure}`;
        }
        return `Product ${product.name} (${product.sku}) exists, but I couldn't find stock information.`;
      }

      if (warehouse) {
        // Show all products in warehouse
        const productsInWarehouse = products
          .map(p => ({
            product: p,
            stock: p.stock[warehouse.id] || 0,
          }))
          .filter(p => p.stock > 0)
          .sort((a, b) => b.stock - a.stock);

        if (productsInWarehouse.length === 0) {
          return `No products currently in stock at ${warehouse.name}.`;
        }

        let response = `Products in ${warehouse.name}:\n\n`;
        productsInWarehouse.forEach((p, idx) => {
          response += `${idx + 1}. ${p.product.name} (${p.product.sku}): ${p.stock.toLocaleString()} ${p.product.unitOfMeasure}\n`;
        });
        return response;
      }

      return "I need more information. Please specify the product name/SKU and/or warehouse name. For example: 'What's the stock of Product X in Warehouse Y?'";
    }

    // Product questions
    if (lowerQuestion.includes('product') || lowerQuestion.includes('products')) {
      if (lowerQuestion.includes('list') || lowerQuestion.includes('all') || lowerQuestion.includes('show')) {
        if (products.length === 0) {
          return "There are no products in the system.";
        }
        let response = `Here are all ${products.length} product(s):\n\n`;
        products.slice(0, 20).forEach((p, idx) => {
          const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
          response += `${idx + 1}. ${p.name} (${p.sku}) - Stock: ${totalStock.toLocaleString()} ${p.unitOfMeasure}\n`;
        });
        if (products.length > 20) {
          response += `\n... and ${products.length - 20} more products.`;
        }
        return response;
      }

      const product = findProduct(question);
      if (product) {
        const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
        const stockByWarehouse = Object.entries(product.stock)
          .map(([whId, qty]) => {
            const wh = warehouses.find(w => w.id === whId);
            return wh ? `${wh.name}: ${qty.toLocaleString()}` : null;
          })
          .filter(Boolean)
          .join(', ');

        return `Product Details:\n\nName: ${product.name}\nSKU: ${product.sku}\nCategory: ${product.category}\nUnit: ${product.unitOfMeasure}\nTotal Stock: ${totalStock.toLocaleString()} ${product.unitOfMeasure}\nStock by Warehouse: ${stockByWarehouse || 'None'}`;
      }

      return `I found ${products.length} product(s) in the system. You can ask me about a specific product by name or SKU.`;
    }

    // Receipt questions
    if (lowerQuestion.includes('receipt') || lowerQuestion.includes('receipts')) {
      const pending = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
      const total = receipts.length;
      return `Receipts Summary:\n\nTotal Receipts: ${total}\nPending Receipts: ${pending}\nCompleted: ${total - pending}`;
    }

    // Delivery questions
    if (lowerQuestion.includes('delivery') || lowerQuestion.includes('deliveries')) {
      const pending = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
      const total = deliveries.length;
      return `Deliveries Summary:\n\nTotal Deliveries: ${total}\nPending Deliveries: ${pending}\nCompleted: ${total - pending}`;
    }

    // Transfer questions
    if (lowerQuestion.includes('transfer') || lowerQuestion.includes('transfers')) {
      const pending = transfers.filter(t => t.status !== 'done' && t.status !== 'canceled').length;
      const total = transfers.length;
      return `Transfers Summary:\n\nTotal Transfers: ${total}\nPending Transfers: ${pending}\nCompleted: ${total - pending}`;
    }

    // Adjustment questions
    if (lowerQuestion.includes('adjustment') || lowerQuestion.includes('adjustments')) {
      const pending = adjustments.filter(a => a.status !== 'done' && a.status !== 'canceled').length;
      const total = adjustments.length;
      return `Adjustments Summary:\n\nTotal Adjustments: ${total}\nPending Adjustments: ${pending}\nCompleted: ${total - pending}`;
    }

    // Low stock questions
    if (lowerQuestion.includes('low stock') || lowerQuestion.includes('low inventory')) {
      const lowStockItems = products.filter(p => {
        const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
        return p.minStock && totalStock <= p.minStock;
      });

      if (lowStockItems.length === 0) {
        return "Great news! There are no products with low stock levels.";
      }

      let response = `Low Stock Alert:\n\nFound ${lowStockItems.length} product(s) with low stock:\n\n`;
      lowStockItems.forEach((p, idx) => {
        const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
        response += `${idx + 1}. ${p.name} (${p.sku}): ${totalStock.toLocaleString()} ${p.unitOfMeasure} (Min: ${p.minStock})\n`;
      });
      return response;
    }

    // Total stock question
    if (lowerQuestion.includes('total stock') || lowerQuestion.includes('total inventory')) {
      const totalStock = products.reduce((sum, p) => {
        return sum + Object.values(p.stock).reduce((a, b) => a + b, 0);
      }, 0);
      return `Total Stock Across All Warehouses: ${totalStock.toLocaleString()} units`;
    }

    // Supplier questions
    if (lowerQuestion.includes('supplier') || lowerQuestion.includes('suppliers')) {
      if (suppliers.length === 0) {
        return "There are no suppliers in the system.";
      }
      let response = `Here are all ${suppliers.length} supplier(s):\n\n`;
      suppliers.forEach((s, idx) => {
        response += `${idx + 1}. ${s.name}\n   Email: ${s.email}\n   Phone: ${s.phone}\n\n`;
      });
      return response;
    }

    // Help/Greeting
    if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you do')) {
      return `I can help you with:\n\n• Warehouse information (list, details, locations)\n• Product information (details, stock levels)\n• Stock queries (stock of product X in warehouse Y)\n• Receipts, Deliveries, Transfers, Adjustments summaries\n• Low stock alerts\n• Supplier information\n\nTry asking:\n- "List all warehouses"\n- "What's the stock of Product X in Warehouse Y?"\n- "Show me low stock items"\n- "How many receipts are pending?"`;
    }

    // Default response
    return "I'm not sure I understand that question. I can help you with:\n\n• Warehouse and product information\n• Stock levels\n• Receipts, deliveries, transfers, and adjustments\n• Low stock alerts\n\nTry asking 'help' for more examples, or be more specific with your question.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      text: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const answer = parseQuestion(input.trim());
      const botMessage: Message = {
        id: generateId(),
        text: answer,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground z-50"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-accent" />
              Inventory Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.isBot ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      message.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.text}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about inventory..."
                  className="flex-1 bg-background"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;

