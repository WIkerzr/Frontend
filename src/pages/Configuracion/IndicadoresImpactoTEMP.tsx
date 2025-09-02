export interface UnidadesMedida {
    id: number;
    nameEs: string;
    nameEu: string;
}

export interface Categorias {
    id: number;
    nameEs: string;
    nameEu: string;
    unidadMedida: number;
}
export interface IndicadoresImpacto {
    id: number;
    nameEs: string;
    nameEu: string;
    unidadMedida?: number;
    categorias?: number[];
}

export const unidadesMedida: UnidadesMedida[] = [
    { id: 1, nameEs: 'Número', nameEu: 'Kopurua' },
    { id: 2, nameEs: 'Porcentaje', nameEu: 'Ehunekoa' },
    { id: 3, nameEs: 'Hectárea (ha)', nameEu: 'Hektarea (ha)' },
    { id: 4, nameEs: 'Euros', nameEu: 'Euroak' },
    { id: 5, nameEs: 'Euros/habitante', nameEu: 'Euroak/biztanle' },
    { id: 6, nameEs: 'Litros/habitante/día', nameEu: 'Litro/biztanle/egun' },
    { id: 7, nameEs: 'Kw/habitante y m2 /habitante', nameEu: 'Kw/biztanle eta m2 /biztanle' },
    { id: 8, nameEs: 'Número y Porcentaje', nameEu: 'Kopurua eta ehunekoa' },
    { id: 9, nameEs: 'Euros y Porcentaje', nameEu: 'Euroak eta ehunekoa' },
    { id: 10, nameEs: 'Sin unidad', nameEu: 'unitaterik ez duena' },
    { id: 11, nameEs: 'Hab/Km2', nameEu: 'Biztnaleak/Km2' },
    { id: 12, nameEs: 'Hectáreas y porcentaje', nameEu: 'Hektarea eta ehunekoa' },
    { id: 13, nameEs: 'kWh', nameEu: 'Kilowatt-ordu' },
];

export const categorias: Categorias[] = [
    { id: 1, nameEs: 'Mujeres 1-15 años', nameEu: 'Emakumeak 1-15 urte', unidadMedida: 1 },
    { id: 2, nameEs: 'Mujeres 16-30 años', nameEu: 'Emakumeak 16-30 urte', unidadMedida: 1 },
    { id: 3, nameEs: 'Mujeres 31-45 años', nameEu: 'Emakumeak 31-45 urte', unidadMedida: 1 },
    { id: 4, nameEs: 'Mujeres 46-60 años', nameEu: 'Emakumeak 46-60 urte', unidadMedida: 1 },
    { id: 5, nameEs: 'Mujeres 61-75 años', nameEu: 'Emakumeak 61-75 urte', unidadMedida: 1 },
    { id: 6, nameEs: 'Mujeres 76-90 años', nameEu: 'Emakumeak 76-90 urte', unidadMedida: 1 },
    { id: 7, nameEs: 'Mujeres 91-105 años', nameEu: 'Emakumeak 91-105 urte', unidadMedida: 1 },
    { id: 8, nameEs: 'Hombres 1-15 años', nameEu: 'Gizonezkoak 1-15 urte', unidadMedida: 1 },
    { id: 9, nameEs: 'Hombres 16-30 años', nameEu: 'Gizonezkoak 16-30 urte', unidadMedida: 1 },
    { id: 10, nameEs: 'Hombres 31-45 años', nameEu: 'Gizonezkoak 31-45 urte', unidadMedida: 1 },
    { id: 11, nameEs: 'Hombres 46-60 años', nameEu: 'Gizonezkoak 46-60 urte', unidadMedida: 1 },
    { id: 12, nameEs: 'Hombres 61-75 años', nameEu: 'Gizonezkoak 61-75 urte', unidadMedida: 1 },
    { id: 13, nameEs: 'Hombres 76-90 años', nameEu: 'Gizonezkoak 76-90 urte', unidadMedida: 1 },
    { id: 14, nameEs: 'Hombres 91-105 años', nameEu: 'Gizonezkoak 91-105 urte', unidadMedida: 1 },
    { id: 15, nameEs: 'Total 1-15 años', nameEu: 'Guztira 1-15 urte', unidadMedida: 1 },
    { id: 16, nameEs: 'Total 16-39 años', nameEu: 'Guztira 16-39 urte', unidadMedida: 1 },
    { id: 17, nameEs: 'Total 31-45 años', nameEu: 'Guztira 31-45 urte', unidadMedida: 1 },
    { id: 18, nameEs: 'Total 46-60 años', nameEu: 'Guztira 46-60 urte', unidadMedida: 1 },
    { id: 19, nameEs: 'Total 61-75 años', nameEu: 'Guztira 61-75 urte', unidadMedida: 1 },
    { id: 20, nameEs: 'Total  76-90 años', nameEu: 'Guztira 76-90 urte', unidadMedida: 1 },
    { id: 21, nameEs: 'Total 91-105 años', nameEu: 'Guztira 91-105 urte', unidadMedida: 1 },
    { id: 22, nameEs: '%', nameEu: '%', unidadMedida: 2 },
    { id: 23, nameEs: 'Fotovoltaica', nameEu: 'Fotovoltaikoa', unidadMedida: 7 },
    { id: 24, nameEs: 'Hidráulica', nameEu: 'Hidraulikoa', unidadMedida: 7 },
    { id: 25, nameEs: 'Eólica', nameEu: 'Eolikoa', unidadMedida: 7 },
    { id: 26, nameEs: 'Solar térmica', nameEu: 'Eguzki termikoa', unidadMedida: 7 },
    { id: 27, nameEs: 'Total Primario', nameEu: 'Primario Guztira', unidadMedida: 4 },
    { id: 28, nameEs: '% Primario', nameEu: '% Primario', unidadMedida: 2 },
    { id: 29, nameEs: 'Total Industria', nameEu: 'Industria Guztira', unidadMedida: 4 },
    { id: 30, nameEs: '% Industria', nameEu: '% Industria', unidadMedida: 2 },
    { id: 31, nameEs: 'Total Construcción', nameEu: 'Eraikuntza Guztira', unidadMedida: 4 },
    { id: 32, nameEs: '% Construcción', nameEu: '% Eraikuntza', unidadMedida: 2 },
    { id: 33, nameEs: 'Total Servicios', nameEu: 'Zerbitzu Guztira', unidadMedida: 4 },
    { id: 34, nameEs: '% Servicios', nameEu: '% Zerbitzu', unidadMedida: 2 },
    { id: 35, nameEs: 'Primario', nameEu: 'Primario', unidadMedida: 1 },
    { id: 36, nameEs: 'Industria', nameEu: 'Industria', unidadMedida: 1 },
    { id: 37, nameEs: 'Construcción', nameEu: 'Eraikuntza', unidadMedida: 1 },
    { id: 38, nameEs: 'Servicios', nameEu: 'Zerbitzuak', unidadMedida: 1 },
    { id: 39, nameEs: 'Total agrícola', nameEu: 'Agrikultura Guztira', unidadMedida: 4 },
    { id: 40, nameEs: '% agrícola', nameEu: '% Agrikultura', unidadMedida: 2 },
    { id: 41, nameEs: 'Total ganadero', nameEu: 'Abeltzaintza Guztira', unidadMedida: 4 },
    { id: 42, nameEs: '% ganadero', nameEu: '% Abeltzaintza', unidadMedida: 2 },
    { id: 43, nameEs: 'Total forestal', nameEu: 'Basogintza Guztira', unidadMedida: 4 },
    { id: 44, nameEs: '% forestal', nameEu: '% Basogintza', unidadMedida: 2 },
    { id: 45, nameEs: '% Nivel 0-2 Mujeres', nameEu: '% Maila 0-2 Emakumeak', unidadMedida: 2 },
    { id: 46, nameEs: '% Nivel 0-2 Hombres', nameEu: '% Maila 0-2 Gizonezkoak', unidadMedida: 2 },
    { id: 47, nameEs: '% Nivel 3-4 Mujeres', nameEu: '% Maila 3-4 Emakumeak', unidadMedida: 2 },
    { id: 48, nameEs: '% Nivel 3-4 Hombres', nameEu: '% Maila 3-4 Gizonezkoak', unidadMedida: 2 },
    { id: 49, nameEs: '% Nivel 5-8 Mujeres', nameEu: '% Maila 5-8 Emakumeak', unidadMedida: 2 },
    { id: 50, nameEs: '% Nivel 5-8 Hombres', nameEu: '% Maila 5-8 Gizonezkoak', unidadMedida: 2 },
    { id: 51, nameEs: 'Mujeres', nameEu: 'Emakumeak', unidadMedida: 1 },
    { id: 52, nameEs: 'Mujeres %', nameEu: 'Emakumeak %', unidadMedida: 2 },
    { id: 53, nameEs: 'Mujeres €', nameEu: 'Emakumeak €', unidadMedida: 4 },
    { id: 54, nameEs: 'Hombres', nameEu: 'Gizonezkoak', unidadMedida: 1 },
    { id: 55, nameEs: 'Hombres %', nameEu: 'Gizonezkoak %', unidadMedida: 2 },
    { id: 56, nameEs: 'Hombres €', nameEu: 'Gizonezkoak €', unidadMedida: 4 },
    { id: 57, nameEs: 'Total', nameEu: 'Guztira', unidadMedida: 1 },
    { id: 58, nameEs: 'Total %', nameEu: 'Guztira %', unidadMedida: 2 },
    { id: 59, nameEs: 'Total H', nameEu: 'Guztira H', unidadMedida: 3 },
    { id: 60, nameEs: 'Total €', nameEu: 'Guztira €', unidadMedida: 4 },
];

export const listadoIndicadoresImpacto: IndicadoresImpacto[] = [
    { id: 1, nameEs: 'Población Total. Situación y evolución', nameEu: 'Biztanleria, guztira. Egoera eta bilakaera', unidadMedida: 1 },
    { id: 2, nameEs: 'Tasa de masculinidad total y por tramos de 15 años', nameEu: 'Maskulinitate-tasa guztira eta 15 urteko tarteen arabera', categorias: [8, 9, 10, 11, 12, 13, 14] }, //TODO Revisar categorias: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    { id: 3, nameEs: 'Índice de envejecimiento', nameEu: 'Zahartze-indizea', categorias: [52, 55, 58] },
    { id: 4, nameEs: 'Superficie Forestal Certificada', nameEu: 'Ziurtatutako baso-azalera', unidadMedida: 3 },
    { id: 5, nameEs: 'Superficie de eco regímenes', nameEu: 'Eko-araubideak barne hartzen dituen nekazaritza-azalera', categorias: [22] },
    { id: 6, nameEs: 'Usos no agrarios en suelos agrarios', nameEu: 'Nekazaritzakoak ez diren erabilerak nekazaritza-lurretan', unidadMedida: 2 },
    { id: 7, nameEs: 'Demanda total de agua', nameEu: 'Ur-eskaria guztira', unidadMedida: 6 },
    { id: 8, nameEs: 'Potencia de energía renovable por habitantes y fuente de energía', nameEu: 'Energia berriztagarrien potentzia biztanleko eta energia-iturriko', categorias: [23, 24, 25, 26] },
    { id: 9, nameEs: 'Vivienda principal', nameEu: 'Etxebizitza printzipalak', unidadMedida: 2 },
    { id: 10, nameEs: 'Zonas blancas NGA', nameEu: 'NGA eremu zuriak', unidadMedida: 2 },
    {
        id: 11,
        nameEs: 'Gasto municipal en servicios esenciales por persona: educación, sanidad y servicios sociales y promoción social',
        nameEu: 'Oinarrizko zerbitzuetako udal-gastua pertsonako: hezkuntza, osasuna eta gizarte-zerbitzuak eta gizarte-sustapena',
        unidadMedida: 4,
    },
    {
        id: 12,
        nameEs: 'Establecimientos dedicados a servicios (comercio al por menor + restauración)',
        nameEu: 'Zerbitzuetara bideratutako establezimenduak (txikizkako merkataritza + jatetxeak)',
        unidadMedida: 1,
    },
    { id: 13, nameEs: 'PIB per Cápita', nameEu: 'Biztanleko BPGa', unidadMedida: 4 },
    { id: 14, nameEs: 'VAB por sectores de actividad', nameEu: 'BEG jarduera-sektoreka', categorias: [22, 27, 28, 29, 30, 31, 32, 33, 34, 60] },
    { id: 15, nameEs: 'Explotaciones agrarias', nameEu: 'Nekazaritza-ustiategiak', unidadMedida: 1 },
    { id: 16, nameEs: 'Índice de ocupación turístico', nameEu: 'Turismo-ostatuen okupazio-indizea', unidadMedida: 1 },
    { id: 17, nameEs: 'Nivel de Formación y Cualificación', nameEu: 'Prestakuntza- eta kualifikazio-maila', categorias: [45, 46, 47, 48, 49, 50] },
    { id: 18, nameEs: 'Renta personal', nameEu: 'Errenta pertsonala', categorias: [53, 56, 60] },
    { id: 19, nameEs: 'Tasa de ocupación', nameEu: 'Okupazio-tasa', unidadMedida: 2 },
    { id: 20, nameEs: 'Personas afiliadas por sectores', nameEu: 'Afiliatutako pertsona-kopurua sektoreka', categorias: [35, 36, 37, 38, 57] },
    { id: 21, nameEs: 'Visitantes a Museos y Centros de Interpretación', nameEu: 'Museoetara eta interpretazio-zentroetara joandako bisitariak', categorias: [51, 54, 57] },
    { id: 22, nameEs: 'Asociaciones socioculturales*', nameEu: 'Elkarte-soziokulturalak', unidadMedida: 1 },
    { id: 23, nameEs: 'Densidad de población', nameEu: 'Biztanleria-dentsitatea', unidadMedida: 11 },
    { id: 24, nameEs: 'Índice de infancia', nameEu: 'haurtzaro-indizea', unidadMedida: 2 },
    { id: 25, nameEs: 'Índice de sobreenvejecimiento', nameEu: 'Gainzahartze-indizea', unidadMedida: 2 },
    { id: 26, nameEs: 'Población extranjera', nameEu: 'Biztanleria atzerritarra', unidadMedida: 2 },
    { id: 27, nameEs: 'SAU (Superficie Agraria Útil)', nameEu: 'NAE (Nekazaritzako Azalera Erabilgarria)', unidadMedida: 3 },
    { id: 28, nameEs: 'Superficie pastable en Parques Naturales', nameEu: 'Parke naturaletan bazka daitekeen azalera', unidadMedida: 3 },
    { id: 29, nameEs: 'UGM en conservación de recursos genéticos', nameEu: 'Baliabide genetikoen kontserbazioari atxikitakoa AzLU kopurua', unidadMedida: 8 },
    { id: 30, nameEs: 'Superficie de suelo dedicada a la agricultura ecológica', nameEu: 'Nekazaritza ekologikora bideratutako lurzoru-azalera', categorias: [22, 59] },
    { id: 31, nameEs: 'Cabezas de ganado (menor y mayor) inscritas en ecológico', nameEu: 'Ekologikoan inskribatutako abelburuak (txikiak eta handiak)', unidadMedida: 2 },
    { id: 32, nameEs: 'Consumo eléctrico', nameEu: 'Kontsumo elektrikoa', unidadMedida: 7 },
    { id: 33, nameEs: 'Alojamientos Turísticos con Etiqueta Ecológica Europea', nameEu: 'Europako etiketa ekologikoa duten turismo-ostatuak' },
    { id: 34, nameEs: 'Centros de salud: ambulatorios, centros de salud y consultorios', nameEu: 'Osasun-zentroak: anbulatorioak, osasun-zentroak eta kontsultategiak', unidadMedida: 1 },
    { id: 35, nameEs: 'Farmacias+ botiquines', nameEu: 'Farmaziak + botikinak', unidadMedida: 1 },
    { id: 36, nameEs: 'Centros de día', nameEu: 'Eguneko zentroak', unidadMedida: 1 },
    { id: 37, nameEs: 'Centros Educativos por tipología', nameEu: 'Ikastetxeak tipologiaren arabera', unidadMedida: 1 },
    { id: 38, nameEs: 'PIB', nameEu: 'BPG', unidadMedida: 4 },
    { id: 39, nameEs: 'Establecimientos por sectores', nameEu: 'Establezimenduak sektoreka', categorias: [36, 37, 38, 49] },
    { id: 40, nameEs: 'Establecimientos agroalimentarios y de la madera', nameEu: 'Nekazaritzako elikagaien eta zuraren establezimenduak', categorias: [22, 300] },
    { id: 41, nameEs: 'VAB agrario:agrícola, ganadero y forestal', nameEu: 'Nekazaritzako BEG: nekazaritza, abeltzaintza eta basogintza', categorias: [39, 40, 41, 42, 43, 44, 48] },
    { id: 42, nameEs: 'Alojamientos turísticos', nameEu: 'Turismo-ostatuak', unidadMedida: 1 },
    { id: 43, nameEs: 'Plazas en alojamientos turísticos', nameEu: 'Ostatu turistikoetako plazak', unidadMedida: 1 },
    { id: 44, nameEs: 'Diferencia de renta de trabajo entre hombres y mujeres', nameEu: 'Lan-errentaren aldea gizonen eta emakumeen artean', unidadMedida: 2 }, //TODO unidadMedida: [1,2,3] ?
    { id: 45, nameEs: 'Tasa de paro', nameEu: 'Langabezia-tasa', unidadMedida: 2 },
    { id: 46, nameEs: 'Personas autónomas', nameEu: 'Autonomoak', unidadMedida: 2 },
    { id: 47, nameEs: 'Espacios Bien de Interés Cultural o Patrimonio Cultural de Euskadi', nameEu: 'Euskadiko kultura-intereseko edo kultura-ondareko espazioak', unidadMedida: 1 },
    { id: 48, nameEs: 'Museos y Centros de interpretación', nameEu: 'Museoak eta Interpretazio zentroak', unidadMedida: 1 },
    {
        id: 49,
        nameEs: 'Población por edad. Pirámide por tramos de 15 años',
        nameEu: 'Biztanleria adinaren arabera. 15 urteko tarteen araberako piramidea',
        categorias: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    },
];
