// Comprueba si es un DNI correcto. Acepta NIEs (Extranjeros con X, Y o Z al principio)
//La diferencia es que el NIE (Dni Extranjero) en su primera posición puede tener la letra
//X,Y,Z . Para saber si es correcto X pasa a ser 0 , Y pasa a ser 1 y Z pasa a ser 2
//a continuación se trata como un DNI cualquiera
export function validarDNI(dni) {
  var numero, cadena, letra, letra_numero;
  var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;

  dni = dni.toUpperCase();
  if (!expresion_regular_dni.test(dni)) return false;

  letra = dni.substr(dni.length - 1, 1); //Obtenemos la última posición correspondiente a la letra
  numero = dni.substr(0, dni.length - 1); //número = contenido dni sin la última posición correspondiente a la letra
  numero = numero.replace('X', 0); //Si fuera un NIE sustituimos X=0, Y=1, Z=0
  numero = numero.replace('Y', 1);
  numero = numero.replace('Z', 2);
  numero = numero % 23;
  cadena = 'TRWAGMYFPDXBNJZSQVHLCKET';
  letra_numero = cadena.substring(numero, numero + 1); //Obtenemos la letra correspondiente al nº del DNI
  return letra === letra_numero;
}

// Validación del NIF
export function validarNif(nif) {
  if (!nif || nif.length !== 9) {
    return false;
  }

  var letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  var digits = nif.substr(1, nif.length - 2);
  var letter = nif.substr(0, 1);
  var control = nif.substr(nif.length - 1);
  var sum = 0;
  var i;
  var digit;

  if (!letter.match(/[A-Z]/)) {
    return false;
  }

  for (i = 0; i < digits.length; ++i) {
    digit = parseInt(digits[i]);

    if (isNaN(digit)) {
      return false;
    }

    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit = parseInt(digit / 10) + (digit % 10);
      }

      sum += digit;
    } else {
      sum += digit;
    }
  }

  sum %= 10;
  if (sum !== 0) {
    digit = 10 - sum;
  } else {
    digit = sum;
  }

  if (letter.match(/[ABEH]/)) {
    return String(digit) === control;
  }
  if (letter.match(/[NPQRSW]/)) {
    return letters[digit] === control;
  }

  return String(digit) === control || letters[digit] === control;
}
