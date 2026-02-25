export const firstNames = [
  'James','Michael','Christopher','Jalen','Tyrese','Javon','Malik','DeAndre','Isaiah','Elijah','Liam','Noah','Oliver','Ethan','Mason','Caleb','Logan','Wyatt','Cooper','Dylan',
  'Aiden','Carter','Jaylen','Xavier','Jordan','Zion','Damian','Nolan','Kendrick','Marcus','Andre','Terrence','Donovan','Bryce','Miles','Rashad','Kobe','Kylan','Tobias','Bennett',
  'Mateo','Luca','Hugo','Gabriel','Adrian','Rafael','Santiago','Bruno','Niko','Viktor','Yuki','Kenji','Hassan','Amir','Omar','Samir','Kofi','Kwame','Tariq','Soren'
];

export const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Phillips','Evans','Turner','Parker','Edwards','Collins','Stewart','Morris','Murphy','Cook',
  'Diaz','Reyes','Morgan','Bell','Bailey','Cooper','Richardson','Cox','Howard','Ward','Peterson','Gray','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood'
];

export function generateName(index: number): { firstName: string; lastName: string } {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return { firstName, lastName };
}
