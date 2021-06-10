export default {
  new: () => {
    let first;
    let last;
    let length = 0;

    return {
      length,
      push: (item) => {
        const node = Object.create(null);
        node.value = item;
        if (last) {
          last.next = node;
        } else {
          first = node;
        }
        last = node;
        length += 1;
      },
      pop: () => {
        if (first) {
          const item = first.value;
          first = first.next;
          length -= 1;
          if (!first) {
            last = null;
          }
          return item;
        }
        return null;
      },
      toArray: () => {
        const array = [];
        let item = first;
        while (item) {
          array.push(item.value);
          item = item.next;
        }
        return array;
      },
    };
  },
};
