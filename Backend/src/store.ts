// Datos en memoria (mismos que el frontend). Sin base de datos.

export interface JobItem {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
}

export interface CompanyItem {
  id: string;
  name: string;
  logo?: string;
  description: string;
  email: string;
  location: string;
  jobs?: { id: string }[];
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description: string;
  cvUrl?: string;
}

export interface ApplicationItem {
  id: string;
  jobId: string;
  userId: string;
  userCity: string;
  cvUrl: string;
  message?: string;
  appliedAt: string;
}

export const jobs: JobItem[] = [
  {
    id: "1",
    title: "Desarrollador Frontend",
    company: "Tech Solutions SA",
    city: "Encarnación",
    salary: "3.500.000 - 5.000.000 Gs",
    type: "full-time",
    description:
      "Buscamos un desarrollador frontend con experiencia en React y TypeScript para unirse a nuestro equipo de desarrollo. Trabajarás en proyectos innovadores para clientes locales e internacionales.",
    requirements: [
      "2+ años de experiencia en React",
      "Conocimiento de TypeScript",
      "Experiencia con Git",
      "Inglés intermedio",
    ],
    postedAt: "2026-03-14",
  },
  {
    id: "2",
    title: "Diseñador Gráfico",
    company: "Creativos Itapúa",
    city: "Encarnación",
    salary: "2.800.000 - 3.500.000 Gs",
    type: "full-time",
    description:
      "Empresa de publicidad busca diseñador gráfico creativo para crear material visual para campañas de marketing digital y tradicional.",
    requirements: [
      "Dominio de Adobe Creative Suite",
      "Portfolio de trabajos",
      "Creatividad y atención al detalle",
    ],
    postedAt: "2026-03-13",
  },
  {
    id: "3",
    title: "Contador/a",
    company: "Agro Export SRL",
    city: "Hohenau",
    salary: "4.000.000 - 5.500.000 Gs",
    type: "full-time",
    description:
      "Importante empresa agroexportadora busca contador/a con experiencia en comercio exterior y manejo de IVA.",
    requirements: [
      "Título en Contaduría Pública",
      "3+ años de experiencia",
      "Conocimiento en comercio exterior",
      "Manejo de sistemas contables",
    ],
    postedAt: "2026-03-12",
  },
  {
    id: "4",
    title: "Vendedor/a",
    company: "Supermercado Central",
    city: "Bella Vista",
    salary: "2.200.000 - 2.800.000 Gs",
    type: "full-time",
    description:
      "Buscamos vendedor/a con buena atención al cliente para atención en mostrador y caja.",
    requirements: ["Experiencia en atención al cliente", "Buena presencia", "Disponibilidad horaria"],
    postedAt: "2026-03-11",
  },
  {
    id: "5",
    title: "Ingeniero Agrónomo",
    company: "Cooperativa Colonias Unidas",
    city: "Obligado",
    salary: "6.000.000 - 8.000.000 Gs",
    type: "full-time",
    description:
      "Cooperativa líder en la región busca ingeniero agrónomo para asesoramiento técnico a productores asociados.",
    requirements: [
      "Título en Ingeniería Agronómica",
      "Licencia de conducir",
      "Disponibilidad para viajes",
      "Experiencia en cultivos de la zona",
    ],
    postedAt: "2026-03-10",
  },
  {
    id: "6",
    title: "Asistente Administrativo",
    company: "Clínica San Lucas",
    city: "Trinidad",
    salary: "2.500.000 - 3.000.000 Gs",
    type: "part-time",
    description:
      "Clínica médica busca asistente administrativo para recepción y gestión de turnos.",
    requirements: ["Estudios en administración", "Manejo de PC", "Buena comunicación"],
    postedAt: "2026-03-09",
  },
  {
    id: "7",
    title: "Electricista Industrial",
    company: "Frigorífico Itapúa",
    city: "Cambyretá",
    salary: "4.500.000 - 5.500.000 Gs",
    type: "full-time",
    description:
      "Frigorífico de primer nivel busca electricista industrial con experiencia en mantenimiento de equipos de refrigeración.",
    requirements: [
      "Título técnico en electricidad",
      "Experiencia en industria alimenticia",
      "Disponibilidad para turnos rotativos",
    ],
    postedAt: "2026-03-08",
  },
  {
    id: "8",
    title: "Community Manager",
    company: "Digital Marketing PY",
    city: "Encarnación",
    salary: "2.800.000 - 3.800.000 Gs",
    type: "remote",
    description:
      "Agencia de marketing digital busca community manager para gestión de redes sociales de diversos clientes.",
    requirements: [
      "Experiencia en redes sociales",
      "Creatividad para contenido",
      "Conocimiento de herramientas de diseño",
      "Excelente redacción",
    ],
    postedAt: "2026-03-07",
  },
  {
    id: "9",
    title: "Mecánico Automotriz",
    company: "Taller Hermanos González",
    city: "Capitán Miranda",
    salary: "3.000.000 - 4.000.000 Gs",
    type: "full-time",
    description:
      "Taller mecánico busca profesional con experiencia en diagnóstico y reparación de vehículos.",
    requirements: [
      "Experiencia comprobable",
      "Conocimiento en electrónica automotriz",
      "Herramientas propias (plus)",
    ],
    postedAt: "2026-03-06",
  },
  {
    id: "10",
    title: "Profesor/a de Inglés",
    company: "Instituto de Idiomas Paraná",
    city: "San Juan del Paraná",
    salary: "80.000 - 120.000 Gs/hora",
    type: "part-time",
    description:
      "Instituto de idiomas busca profesor/a de inglés para clases grupales e individuales.",
    requirements: [
      "Nivel avanzado de inglés certificado",
      "Experiencia en enseñanza",
      "Metodología dinámica",
    ],
    postedAt: "2026-03-05",
  },
  {
    id: "11",
    title: "Chef de Cocina",
    company: "Restaurant La Costanera",
    city: "Encarnación",
    salary: "4.000.000 - 5.000.000 Gs",
    type: "full-time",
    description:
      "Restaurante de categoría busca chef con experiencia en cocina internacional y regional.",
    requirements: [
      "Formación gastronómica",
      "5+ años de experiencia",
      "Creatividad culinaria",
      "Liderazgo de equipo",
    ],
    postedAt: "2026-03-04",
  },
  {
    id: "12",
    title: "Desarrollador Backend",
    company: "Software Itapúa",
    city: "Fram",
    salary: "4.000.000 - 6.000.000 Gs",
    type: "remote",
    description:
      "Empresa de desarrollo de software busca desarrollador backend con experiencia en Node.js y bases de datos.",
    requirements: [
      "3+ años de experiencia en backend",
      "Node.js, Python o similar",
      "Bases de datos SQL y NoSQL",
      "APIs RESTful",
    ],
    postedAt: "2026-03-03",
  },
];

export const companies: CompanyItem[] = [
  {
    id: "company-1",
    name: "Tech Solutions SA",
    description:
      "Somos una empresa líder en desarrollo de software y soluciones tecnológicas en la región de Itapúa.",
    email: "rrhh@techsolutions.com.py",
    location: "Encarnación",
  },
  {
    id: "company-2",
    name: "Creativos Itapúa",
    description:
      "Agencia de publicidad y marketing digital. Creamos campañas que conectan marcas con personas.",
    email: "contacto@creativositapua.com.py",
    location: "Encarnación",
  },
  {
    id: "company-3",
    name: "Agro Export SRL",
    description:
      "Empresa agroexportadora con presencia en la región. Comercialización de granos y productos agrícolas.",
    email: "rrhh@agroexport.com.py",
    location: "Hohenau",
  },
  {
    id: "company-4",
    name: "Frigorífico Itapúa",
    description:
      "Industria frigorífica de primer nivel. Procesamiento y exportación de carnes.",
    email: "empleos@frigorificoitapua.com.py",
    location: "Cambyretá",
  },
  {
    id: "company-5",
    name: "Cooperativa Colonias Unidas",
    description:
      "Cooperativa líder en servicios al productor. Asesoramiento técnico y comercialización.",
    email: "rrhh@coloniasunidas.org.py",
    location: "Obligado",
  },
  {
    id: "company-6",
    name: "Software Itapúa",
    description:
      "Desarrollo de software a medida y soluciones empresariales para la región.",
    email: "info@softwareitapua.com.py",
    location: "Fram",
  },
  {
    id: "company-7",
    name: "Empresa Demo",
    description:
      "Cuenta de empresa para gestionar vacantes y postulaciones en Red Nordeste.",
    email: "empresa@rednordeste.com",
    location: "Encarnación",
  },
];

export const users: UserItem[] = [
  {
    id: "user-1",
    name: "María González",
    email: "maria@email.com",
    description:
      "Profesional en administración de empresas con 5 años de experiencia en el sector comercial.",
    cvUrl: "/cv/maria.pdf",
  },
  {
    id: "user-2",
    name: "Carlos Fernández",
    email: "candidato@rednordeste.com",
    description:
      "Desarrollador frontend con experiencia en React y TypeScript. Buscando oportunidades en Itapúa.",
    cvUrl: "/cv/carlos-fernandez.pdf",
  },
];

export const applications: ApplicationItem[] = [
  {
    id: "app-1",
    jobId: "1",
    userId: "user-2",
    userCity: "Encarnación",
    cvUrl: "/cv/carlos-fernandez.pdf",
    message: "Tengo mucha experiencia en React y me gustaría formar parte del equipo.",
    appliedAt: "2026-03-15",
  },
];
