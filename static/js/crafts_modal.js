const wasteCrafts = {
    'Valuable Waste - Cans': {
        label: 'Latas',
        crafts: [
            {
                title: 'Portalápices Decorativo',
                materials: ['Lata limpia', 'Pintura en spray', 'Papel decorativo', 'Pegamento', 'Tijeras'],
                image: {
                    src: '/static/img/portalapices.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/portalapices.jpg'
                },
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
                image: {
                    src: '/static/img/Macetero.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/Macetero.jpg'
                },
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
                image: {
                    src: '/static/img/organizador.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/organizador.jpg'
                },
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
                image: {
                    src: '/static/img/marco.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/marco.jpg'
                },
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
                image: {
                    src: '/static/img/portavelas.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/portavelas.jpg'
                },
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
                image: {
                    src: '/static/img/Terrario.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/Terrario.jpg'
                },
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
                image: {
                    src: '/static/img/campanas.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/campanas.jpg'
                },
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
                image: {
                    src: '/static/img/jardin-decoracion.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/jardin-decoracion.jpg'
                },
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
                image: {
                    src: '/static/img/papel-artesanal.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/papel-artesanal.jpg'
                },
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
                image: {
                    src: '/static/img/origami.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/origami.jpg'
                },
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
                image: {
                    src: '/static/img/macetero-colgante.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/macetero-colgante.jpg'
                },
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
                image: {
                    src: '/static/img/organizado-juguetes.png',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/organizado-juguetes.png'
                },
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
                image: {
                    src: '/static/img/huerto-vertical.png',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/huerto-vertical.png'
                },
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
                image: {
                    src: '/static/img/comedero.jpg',
                    alt: 'Portalápices decorativo hecho con lata reciclada',
                    thumbnail: '/static/img/comedero.jpg'
                },
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
    
    // Actualizar la lista de manualidades con imágenes
    craftsList.innerHTML = '';
    craftsData.crafts.forEach((craft, index) => {
        const craftCard = document.createElement('div');
        craftCard.className = 'craft-card';
        craftCard.innerHTML = `
            <div class="craft-thumbnail">
                <img 
                    src="${craft.image.thumbnail}" 
                    alt="${craft.image.alt}"
                    loading="lazy"
                    class="craft-image"
                />
            </div>
            <div class="craft-info">
                <h3>${craft.title}</h3>
                <p>${craft.materials.length} materiales • ${craft.steps.length} pasos</p>
            </div>
        `;
        
        craftCard.addEventListener('click', () => showCraftDetails(craft));
        craftsList.appendChild(craftCard);
    });
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    function showCraftDetails(craft) {
        craftsList.style.display = 'none';
        craftDetails.classList.remove('hidden');
        craftDetails.classList.add('active');
        backButton.classList.remove('hidden');
        modalTitle.textContent = craft.title;
        
        // Agregar imagen principal en los detalles
        const imageContainer = craftDetails.querySelector('.craft-image-container') || document.createElement('div');
        imageContainer.className = 'craft-image-container';
        imageContainer.innerHTML = `
            <img 
                src="${craft.image.src}" 
                alt="${craft.image.alt}"
                class="craft-detail-image"
                loading="lazy"
            />
        `;
        
        // Asegurarse de que el contenedor de imagen esté en la posición correcta
        const firstChild = craftDetails.firstChild;
        if (firstChild) {
            craftDetails.insertBefore(imageContainer, firstChild);
        } else {
            craftDetails.appendChild(imageContainer);
        }
        
        const materialsList = craftDetails.querySelector('.materials-list');
        materialsList.innerHTML = craft.materials
            .map(material => `
                <li class="material-item">
                    ${material}
                </li>
            `).join('');
        
        const stepsList = craftDetails.querySelector('.steps-list');
        stepsList.innerHTML = craft.steps
            .map(step => `
                <li class="step-item">
                    ${step}
                </li>
            `).join('');
    }
    
    function hideDetails() {
        craftsList.style.display = 'block';
        craftDetails.classList.add('hidden');
        craftDetails.classList.remove('active');
        backButton.classList.add('hidden');
        modalTitle.textContent = 'Manualidades Creativas';
    }
    
    backButton.onclick = hideDetails;
    
    closeButton.onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        hideDetails();
    };
    
    modal.querySelector('.modal-overlay').onclick = (e) => {
        if (e.target === e.currentTarget) {
            closeButton.click();
        }
    };
}
