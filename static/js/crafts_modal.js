const wasteCrafts = {
    'Valuable Waste - Cans': {
        label: 'Latas',
        crafts: [
            {
                title: 'Portalápices Decorativo',
                materials: ['Lata limpia', 'Pintura en spray', 'Papel decorativo', 'Pegamento', 'Tijeras'],
                steps: [
                    'Limpiar bien la lata y quitar etiquetas',
                    'Pintar la lata con el color base deseado',
                    'Decorar con papel decorativo',
                    'Dejar secar completamente'
                ]
            },
            {
                title: 'Macetero Reciclado',
                materials: ['Lata grande', 'Pintura resistente al agua', 'Piedras pequeñas', 'Taladro o clavo para drenaje'],
                steps: [
                    'Hacer agujeros de drenaje en el fondo',
                    'Pintar la lata con diseños a elección',
                    'Colocar piedras en el fondo para drenaje',
                    'Agregar tierra y plantar'
                ]
            }
        ]
    },
    'Valuable Waste - Cardboard': {
        label: 'Carton',
        crafts: [
            {
                title: 'Organizador de Escritorio',
                materials: ['Cajas de cartón', 'Papel decorativo', 'Tijeras', 'Pegamento', 'Regla'],
                steps: [
                    'Cortar las cajas al tamaño deseado',
                    'Forrar con papel decorativo',
                    'Crear divisiones internas',
                    'Decorar el exterior'
                ]
            },
            {
                title: 'Marco de Fotos',
                materials: ['Cartón grueso', 'Pintura', 'Tijeras', 'Papel decorativo', 'Pegamento'],
                steps: [
                    'Cortar dos rectángulos de cartón: uno con ventana para la foto',
                    'Decorar con pintura o papel',
                    'Añadir elementos decorativos',
                    'Pegar las piezas dejando espacio para la foto'
                ]
            }
        ]
    },
    'Valuable Waste - Glass': {
        label: 'Vidrio',
        crafts: [
            {
                title: 'Portavelas Decorativo',
                materials: ['Frasco de vidrio limpio', 'Pintura para vidrio', 'Cinta decorativa', 'Vela pequeña'],
                steps: [
                    'Limpiar y secar bien el frasco',
                    'Pintar con diseños a elección',
                    'Decorar con cinta',
                    'Colocar la vela en el interior'
                ]
            },
            {
                title: 'Terrario Mini Jardín',
                materials: ['Frasco grande de vidrio', 'Piedras pequeñas', 'Tierra para plantas', 'Plantas pequeñas', 'Carbón activado'],
                steps: [
                    'Colocar capa de piedras para drenaje',
                    'Agregar capa de carbón activado',
                    'Añadir tierra para plantas',
                    'Plantar y decorar'
                ]
            }
        ]
    },
    'Valuable Waste - Metal': {
        label: 'Metal',
        crafts: [
            {
                title: 'Campanas de Viento',
                materials: ['Piezas metálicas variadas', 'Cuerda resistente', 'Herramientas para perforar', 'Pinturas para metal'],
                steps: [
                    'Limpiar y preparar las piezas metálicas',
                    'Hacer agujeros para colgar',
                    'Pintar y decorar',
                    'Ensamblar con cuerdas a diferentes alturas'
                ]
            },
            {
                title: 'Decoración de Jardín',
                materials: ['Objetos metálicos variados', 'Pintura para exterior', 'Alambre', 'Herramientas básicas'],
                steps: [
                    'Seleccionar y limpiar las piezas',
                    'Pintar con colores resistentes al exterior',
                    'Crear diseño y ensamblar',
                    'Aplicar sellador para proteger'
                ]
            }
        ]
    },
    'Valuable Waste - Paper': {
        label: 'Papel',
        crafts: [
            {
                title: 'Papel Reciclado Artesanal',
                materials: ['Papel usado', 'Agua', 'Bastidor con malla', 'Recipiente grande', 'Decoraciones (opcional)'],
                steps: [
                    'Triturar el papel en pequeños pedazos',
                    'Remojar en agua por 24 horas',
                    'Licuar para crear pulpa',
                    'Colar con bastidor y dejar secar'
                ]
            },
            {
                title: 'Origami Decorativo',
                materials: ['Papel usado (un lado limpio)', 'Tijeras', 'Regla', 'Lápiz'],
                steps: [
                    'Cortar papel en cuadrados perfectos',
                    'Seguir patrones de doblado básico',
                    'Crear figuras decorativas',
                    'Unir varias piezas para crear móviles'
                ]
            }
        ]
    },
    'Valuable Waste - Plastic': {
        label: 'Plástico',
        crafts: [
            {
                title: 'Maceteros Colgantes',
                materials: ['Envases de plástico grandes', 'Cuerda resistente', 'Tijeras', 'Pintura para plástico'],
                steps: [
                    'Limpiar bien los envases',
                    'Hacer agujeros para drenaje y colgar',
                    'Pintar y decorar',
                    'Montar sistema de colgado'
                ]
            },
            {
                title: 'Organizador de Juguetes',
                materials: ['Envases de plástico grandes', 'Cinta adhesiva decorativa', 'Tijeras', 'Etiquetas'],
                steps: [
                    'Limpiar y quitar etiquetas',
                    'Cortar aperturas si es necesario',
                    'Decorar con cinta adhesiva',
                    'Etiquetar para organización'
                ]
            }
        ]
    },
    'Valuable Waste - Plastic bottles': {
        label: 'Botella',
        crafts: [
            {
                title: 'Huerto Vertical',
                materials: ['Botellas plásticas grandes', 'Cuerda resistente', 'Tijeras', 'Tierra para plantas'],
                steps: [
                    'Cortar un lateral de la botella',
                    'Hacer agujeros de drenaje',
                    'Unir las botellas con cuerda',
                    'Llenar con tierra y plantar'
                ]
            },
            {
                title: 'Comedero para Pájaros',
                materials: ['Botella plástica limpia', 'Palitos de madera', 'Cuerda', 'Tijeras'],
                steps: [
                    'Hacer pequeños agujeros para perchar',
                    'Crear aberturas para el alimento',
                    'Insertar los palitos como perchas',
                    'Colgar en un lugar adecuado'
                ]
            }
        ]
    }
};
function openCraftsModal(searchTerm) {
    const modal = document.getElementById('craftsModal');
    const craftsList = document.getElementById('craftsList');
    const craftDetails = document.getElementById('craftDetails');
    const backButton = document.getElementById('backButton');
    const closeButton = document.getElementById('closeButton');
    const modalTitle = document.querySelector('.modal-title');
    
    // Encontrar el tipo de residuo correcto
    const wasteEntry = Object.entries(wasteCrafts).find(([key, value]) => {
        const searchTermLower = searchTerm.toLowerCase();
        return value.label.toLowerCase() === searchTermLower || 
               key.toLowerCase().includes(searchTermLower);
    });
    
    if (!wasteEntry) {
        console.error('No se encontraron manualidades para:', searchTerm);
        return;
    }
    
    const [wasteType, craftsData] = wasteEntry;
    
    // Limpiar y llenar la lista de manualidades
    craftsList.innerHTML = '';
    craftsData.crafts.forEach((craft, index) => {
        const craftCard = document.createElement('div');
        craftCard.className = 'craft-card';
        craftCard.innerHTML = `
            <h3>${craft.title}</h3>
            <p>${craft.materials.length} materiales • ${craft.steps.length} pasos</p>
        `;
        
        craftCard.addEventListener('click', () => showCraftDetails(craft));
        craftsList.appendChild(craftCard);
    });
    
    // Mostrar el modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Función para mostrar detalles
    function showCraftDetails(craft) {
        craftsList.style.display = 'none';
        craftDetails.classList.remove('hidden');
        craftDetails.classList.add('active');
        backButton.classList.remove('hidden');
        modalTitle.textContent = craft.title;
        
        // Actualizar materiales - Eliminado el span con el punto verde
        const materialsList = craftDetails.querySelector('.materials-list');
        materialsList.innerHTML = craft.materials
            .map(material => `
                <li class="material-item">
                    ${material}
                </li>
            `).join('');
        
        // Actualizar pasos - Eliminado el span con el número
        const stepsList = craftDetails.querySelector('.steps-list');
        stepsList.innerHTML = craft.steps
            .map(step => `
                <li class="step-item">
                    ${step}
                </li>
            `).join('');
    }
    
    // Función para ocultar detalles
    function hideDetails() {
        craftsList.style.display = 'block';
        craftDetails.classList.add('hidden');
        craftDetails.classList.remove('active');
        backButton.classList.add('hidden');
        modalTitle.textContent = 'Manualidades Creativas';
    }
    
    // Event Listeners
    backButton.onclick = hideDetails;
    
    closeButton.onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        hideDetails();
    };
    
    // Cerrar al hacer clic en el overlay
    modal.querySelector('.modal-overlay').onclick = (e) => {
        if (e.target === e.currentTarget) {
            closeButton.click();
        }
    };
}