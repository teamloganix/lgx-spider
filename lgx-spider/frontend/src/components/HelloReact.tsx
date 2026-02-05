import React from 'react';

type HelloReactProps = {
  name?: string;
};

export default function HelloReact({ name = 'React' }: HelloReactProps) {
  return (
    <div data-testid="hello-react" className="rounded-lg border px-4 py-2 bg-gray-100">
      Hello from {name}
    </div>
  );
}
