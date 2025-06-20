/* src/components/ConfidenceTile.tsx */
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/ui/Button';
import * as Popover from '@radix-ui/react-popover';

interface ConfidenceTileProps {
  confidence: number;
  userId: string;
}

export default function ConfidenceTile({ confidence, userId }: ConfidenceTileProps) {
  const [open, setOpen] = useState(false);
  const [newConfidence, setNewConfidence] = useState(confidence);
  const [loading, setLoading] = useState(false);

  async function updateConfidence() {
    if (isNaN(newConfidence) || newConfidence < 0 || newConfidence > 10) {
      alert('Please enter a number between 0 and 10.');
      return;
    }

    setLoading(true);
    await supabase
      .from('profiles')
      .update({ confidence_level: newConfidence })
      .eq('id', userId);

    setLoading(false);
    setOpen(false);
    location.reload();
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div className="bg-white border border-grey-200 rounded-xl shadow p-4 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <p className="text-2xl font-bold text-brand-navy">{confidence}/10</p>
            <p className="text-sm text-grey-600">Confidence ✎</p>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} className="bg-white border border-grey-200 rounded-lg p-4 shadow-xl max-w-xs z-50">
          <h3 className="text-lg font-semibold text-brand-navy mb-2">Edit Confidence</h3>
          <input
            type="number"
            min="0"
            max="10"
            value={newConfidence}
            onChange={(e) => setNewConfidence(parseInt(e.target.value))}
            className="w-full border border-grey-300 rounded px-3 py-2 text-lg mb-3 focus:outline-none focus:ring focus:border-brand-teal"
          />
          <div className="flex justify-end gap-2">
            <Button
              intent="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              size="sm"
              onClick={updateConfidence}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}