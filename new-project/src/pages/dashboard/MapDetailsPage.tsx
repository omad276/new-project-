import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, MapPin, Ruler, AlertCircle, FileText, Scale, CheckCircle } from 'lucide-react';
import { BlueprintViewer } from '@/components/BlueprintViewer';
import { Button } from '@/components/ui/Button';
import { mapApi } from '@/services/mapApi';
import { measurementApi } from '@/services/measurementApi';
import type { CreateMeasurementPayload, Measurement, ScaleUnit } from '@/types';

export function MapDetailsPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Fetch map details
  const {
    data: map,
    isLoading: mapLoading,
    error: mapError,
  } = useQuery({
    queryKey: ['map', mapId],
    queryFn: () => mapApi.getMap(mapId!),
    enabled: !!mapId,
  });

  // Fetch measurements for this map
  const {
    data: measurements,
    isLoading: measurementsLoading,
  } = useQuery({
    queryKey: ['measurements', mapId],
    queryFn: () => measurementApi.getMapMeasurements(mapId!),
    enabled: !!mapId,
  });

  // Create measurement mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateMeasurementPayload) =>
      measurementApi.createMeasurement(mapId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements', mapId] });
    },
  });

  // Delete measurement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => measurementApi.deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements', mapId] });
    },
  });

  // Calibrate map mutation
  const calibrateMutation = useMutation({
    mutationFn: (data: { pixelDistance: number; realDistance: number; unit: ScaleUnit }) =>
      mapApi.calibrateMap(mapId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['map', mapId] });
      // Invalidate measurements too since they'll be recalculated with new scale
      queryClient.invalidateQueries({ queryKey: ['measurements', mapId] });
    },
  });

  // Handle calibration from BlueprintViewer
  const handleCalibrate = useCallback(
    (data: { pixelDistance: number; realDistance: number; unit: ScaleUnit }) => {
      calibrateMutation.mutate(data);
    },
    [calibrateMutation]
  );

  // Handle measurement creation from BlueprintViewer
  const handleMeasurementCreate = useCallback(
    (measurement: Omit<Measurement, 'id' | 'mapId' | 'createdAt' | 'updatedAt'>) => {
      createMutation.mutate(measurement);
    },
    [createMutation]
  );

  // Handle measurement deletion
  const handleMeasurementDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  // Go back to project
  const handleBack = useCallback(() => {
    if (map?.project) {
      navigate(`/dashboard/projects/${map.project}`);
    } else {
      navigate(-1);
    }
  }, [map, navigate]);

  // Memoized measurements count by type
  const measurementStats = useMemo(() => {
    if (!measurements) return { total: 0, distance: 0, area: 0, angle: 0 };
    return {
      total: measurements.length,
      distance: measurements.filter((m) => m.type === 'distance').length,
      area: measurements.filter((m) => m.type === 'area').length,
      angle: measurements.filter((m) => m.type === 'angle').length,
    };
  }, [measurements]);

  // Loading state
  if (mapLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-secondary">
            {isArabic ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (mapError || !map) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            {isArabic ? 'الخريطة غير موجودة' : 'Map not found'}
          </h2>
          <p className="text-text-secondary">
            {isArabic
              ? 'لم نتمكن من العثور على الخريطة المطلوبة. قد تكون محذوفة أو غير متاحة.'
              : 'We couldn\'t find the requested map. It may have been deleted or is unavailable.'}
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            <ArrowLeft className="w-4 h-4" />
            {isArabic ? 'العودة' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Back button and map info */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'رجوع' : 'Back'}
              </span>
            </Button>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary truncate">
                {map.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                {map.projectName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {isArabic ? map.projectNameAr || map.projectName : map.projectName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {map.fileType.toUpperCase()}
                </span>
                {map.isCalibrated ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {isArabic ? 'معاير' : 'Calibrated'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    {isArabic ? 'غير معاير' : 'Not Calibrated'}
                  </span>
                )}
                {map.scale && (
                  <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                    <Scale className="w-3 h-3" />
                    1px = {map.scale.ratio.toFixed(4)} {map.scale.unit}
                  </span>
                )}
                {map.originalFileName && (
                  <span className="text-xs text-text-secondary/70 truncate max-w-[200px]">
                    {map.originalFileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Measurement stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <Ruler className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <span className="font-semibold text-text-primary">
                  {measurementStats.total}
                </span>
                <span className="text-text-secondary ml-1">
                  {isArabic ? 'قياس' : measurementStats.total === 1 ? 'measurement' : 'measurements'}
                </span>
              </div>
            </div>

            {measurementStats.total > 0 && (
              <div className="hidden md:flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {measurementStats.distance} {isArabic ? 'مسافة' : 'distance'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {measurementStats.area} {isArabic ? 'مساحة' : 'area'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {measurementStats.angle} {isArabic ? 'زاوية' : 'angle'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blueprint Viewer */}
      <div className="flex-1 relative bg-gray-900">
        {measurementsLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : null}

        <BlueprintViewer
          src={map.downloadUrl}
          alt={map.name}
          editable
          measurements={measurements || []}
          onMeasurementCreate={handleMeasurementCreate}
          onMeasurementDelete={handleMeasurementDelete}
          showMeasurements
          className="w-full h-full"
          mapScale={map.scale}
          isCalibrated={map.isCalibrated}
          onCalibrate={handleCalibrate}
        />
      </div>

      {/* Mutation status indicators */}
      {(createMutation.isPending || deleteMutation.isPending || calibrateMutation.isPending) && (
        <div className="absolute bottom-4 right-4 bg-surface border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-text-secondary">
            {createMutation.isPending
              ? isArabic ? 'جاري الحفظ...' : 'Saving...'
              : calibrateMutation.isPending
              ? isArabic ? 'جاري المعايرة...' : 'Calibrating...'
              : isArabic ? 'جاري الحذف...' : 'Deleting...'}
          </span>
        </div>
      )}
    </div>
  );
}

export default MapDetailsPage;
