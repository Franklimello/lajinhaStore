// Utilitários de validação para segurança
export const validateInput = {
  // Sanitiza texto para prevenir XSS
  sanitizeText: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Valida email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Valida telefone brasileiro
  isValidPhone: (phone) => {
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
  },

  // Valida nome (mínimo 2 caracteres, apenas letras e espaços)
  isValidName: (name) => {
    if (!name || typeof name !== 'string') return false;
    const cleanName = name.trim();
    return cleanName.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(cleanName);
  },

  // Valida endereço
  isValidAddress: (address) => {
    if (!address || typeof address !== 'string') return false;
    const cleanAddress = address.trim();
    return cleanAddress.length >= 5 && cleanAddress.length <= 200;
  },

  // Valida preço (número positivo)
  isValidPrice: (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0 && numPrice <= 999999.99;
  },

  // Valida quantidade (número inteiro positivo)
  isValidQuantity: (quantity) => {
    const numQuantity = parseInt(quantity);
    return !isNaN(numQuantity) && numQuantity > 0 && numQuantity <= 999;
  },

  // Valida URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Função para sanitizar dados de formulário
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = validateInput.sanitizeText(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Função para validar dados de produto
export const validateProductData = (productData) => {
  const errors = [];
  
  if (!validateInput.isValidName(productData.nome || productData.titulo)) {
    errors.push('Nome do produto inválido');
  }
  
  if (!validateInput.isValidPrice(productData.preco)) {
    errors.push('Preço inválido');
  }
  
  if (productData.descricao && productData.descricao.length > 1000) {
    errors.push('Descrição muito longa');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Função para validar dados de pedido
export const validateOrderData = (orderData) => {
  const errors = [];
  
  if (!validateInput.isValidName(orderData.clientName)) {
    errors.push('Nome do cliente inválido');
  }
  
  if (!validateInput.isValidPhone(orderData.clientPhone)) {
    errors.push('Telefone inválido');
  }
  
  if (!validateInput.isValidAddress(orderData.clientRua)) {
    errors.push('Endereço inválido');
  }
  
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Carrinho vazio');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


