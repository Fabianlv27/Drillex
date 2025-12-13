export  const Shuffler = (Array) => {
    const Shuffled = [...Array];

    for (let i = Shuffled.length - 1; i > 0; i--) {
      let RandomNum = Math.floor(Math.random() * (i + 1));
      let temp = Shuffled[i];
      Shuffled[i] = Shuffled[RandomNum];
      Shuffled[RandomNum] = temp;
    }
    return Shuffled;
  };
 